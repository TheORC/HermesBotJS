const logger = require('./Logger.js');
const Song = require('./song.js');
const { shuffleArray, asyncCallWithTimeout } = require('../utils/function.js');

const WaitQueue = require('wait-queue');

const {
  NoSubscriberBehavior,
  createAudioPlayer,
  entersState,
  VoiceConnectionStatus,
  VoiceConnectionDisconnectReason,
  AudioPlayerStatus
} = require('@discordjs/voice');


class AudioPlayer {

  constructor(client, voiceConnection){
    this.client = client;

    // The connection to the discord channel
    this.voiceConnection = voiceConnection;

    // The Audio player
    this.audioPlayer = createAudioPlayer();

    // Create a song queue
    this.queue = new WaitQueue(); // :O
    this.queueLock = false;
    this.readyLock = false;

    // Setup event listeners
    this.voiceConnection.on('stateChange',
			async (any, newState) => {
				if (newState.status === VoiceConnectionStatus.Disconnected) {
					if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
						/**
						 * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						 * but there is a chance the connection will recover itself if the reason of the disconnect was due to
						 * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						 * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						 * the voice connection.
						 */
						try {
							await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
							// Probably moved voice channel
						} catch {
							this.voiceConnection.destroy();
              console.log('Was removed!');
							// Probably removed from voice channel
						}
					} else if (this.voiceConnection.rejoinAttempts < 5) {
						/**
						 * The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
						 */
						await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
						this.voiceConnection.rejoin();
					} else {
						/**
						 * The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
						 */
						this.voiceConnection.destroy();
					}
				} else if (newState.status === VoiceConnectionStatus.Destroyed) {
					/**
					 * Once destroyed, stop the subscription.
					 */
					this.stop();
				} else if (
					!this.readyLock &&
					(newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
				) {
					/**
					 * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					 * before destroying the voice connection. This stops the voice connection permanently existing in one of these
					 * states.
					 */
					this.readyLock = true;
					try {
						await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
					} catch {
						if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
					} finally {
						this.readyLock = false;
					}
				}
			},
		);

    this.audioPlayer.on('stateChange',
      (oldState, newState) => {

  			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
  				// If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
  				// The queue is then processed to start playing the next track, if one is available.
          this.onSongFinish();

  			} else if (newState.status === AudioPlayerStatus.Playing) {
  				// If the Playing state has been entered, then a new track has started playback.
          this.onSongStart();
  			}
			},
    );

    this.audioPlayer.on('error',
      (error) => {
        logger.error(error);
      }
    );

    // Subscribe the audio player to the voice connection
    this.voiceConnection.subscribe(this.audioPlayer);
  }

  stop(){
    this.queueLock = true;
    this.queue = new WaitQueue(); // Create a new queue
    this.audioPlayer.stop(true);
  }

  onSongStart(){
    logger.log('Song started playing.');
  }

  onSongFinish(){
    logger.log('Song has finished.');
    this.processQueue
  }

  async enqueue(song) {
    await this.queue.push(song); // Add the new song
    await this.processQueue();
  }

  async getNextSong(){
    return await this.queue.shift();
  }

  async processQueue(){

    // We are not in a position to play a song.
    if(this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle)
      return;

    const getNextSong = new Promise((resolve, reject) => {
      this.queue.shift().then((item) => {
        resolve(item);
      });
    });

    let nextSong;

    try {
      nextSong = await asyncCallWithTimeout(getNextSong, 1_000);
    }catch(err){

      console.log(err);

      if(e === 'timeout'){
        const guildID = this.voiceConnection.joinConfig.guildId;
        await this.client.musicplayer.AnotherStop(guildID);
      }

      return;
    }

    try {
      const songResource = await nextSong.createAudioResource();
      console.log(songResource);
      this.audioPlayer.play(songResource);
      this.queueLock = false;
    }catch(error){
      logger.error(error);
      this.queueLock = false;
      await this.processQueue();
    }
  }

  getStatus(){
    return this.audioPlayer.state?.status;
  }

  async pause(){
    await this.audioPlayer.pause();
  }

  async resume(){
    await this.audioPlayer.unpause();
  }

  // When we stop the audioplayer, the onStateChange event
  // will handle the switch to the next song.
  async skip(){
    await this.audioPlayer.stop();
  }

  async shuffle(){
    this.queue = shuffleArray(this.queue);
  }

  getQueue(){
    return this.queue;
  }
}

module.exports = AudioPlayer;
