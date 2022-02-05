const logger = require('./Logger.js');
const Song = require('./song.js');
const { shuffleArray, asyncCallWithTimeout } = require('../utils/function.js');

// const WaitQueue = require('wait-queue');
const WaitQueue = require('./asynclist.js');

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
    this.queue = [];
    this.queueLock = false;
    this.readyLock = false;

    this.volume = 0.5;

    this.loopSong = false;
    this.loopSongSkip = false;
    this.isSkip = false;

    this.loopPlaylist = false;
    this.currentSong = null;
    this.currentResorce = null;
    this.idleTimer = null;

    // Attempt to play the song three times
    this.songAttempts = 3;
    this.currentAttempt = 0;
    this.attemptTimer = null;

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

  /**
  * This method is called when a song starts playing.
  */
  onSongStart() {
    logger.log('Song started playing.');
  }

  /**
  * This method is called when a song finishes playing.
  */
  onSongFinish() {
    logger.log('Song has finished.');
    this.processQueue();
  }

  /**
  * This method is called when a song stops befor it should
  */
  onSongFailed(){
    logger.warn('Song finished early.');
  }

  /**
  * Get the current state of the AudioPlayer
  * @return {AudioPlayerStatus}
  */
  getStatus() {
    return this.audioPlayer.state?.status;
  }

  /**
  * Gets the current song which is being played.
  * @return {Song}
  */
  getCurrentSong() {
    return this.currentSong;
  }

  /**
  * Gets all the songs in the queue.
  * @return {Array} - List of songs
  */
  getQueue() {
    return this.queue;
  }

  /**
  * Clears the qudio queue.
  */
  clearQueue() {
    for(let i = 0; i < this.queue.length; i++)
      delete this.queue[i];
    this.queue = [];
    this.loopSong = false;
    this.loopPlaylist = false;
  }

  /**
  * Randomly shuffles the queue.
  */
  shuffleQueue(){
    this.queue = shuffleArray(this.queue);
  }

  /**
  * Stops the audio player.
  * The elements in the audio queue are deleted.
  */
  stop() {
    this.queueLock = true;
    this.clearQueue();
    this.audioPlayer.stop(true);
  }

  /**
  * Sets the volume of the audio player.
  * @param {number} - number between 1 and 100
  */
  setVolume(volume) {
    this.volume = volume;
    this.currentResorce.volume.setVolume(volume);
  }

  /**
  * Set the audio player to loop the current song.
  */
  setLoopSong() {
    this.loopSong = true; // Toggle
    this.loopSongSkip = false;
    this.loopPlaylist = false;
  }

  /**
  * Set the audio player to loop the current queue.
  */
  setLoopPlaylist() {
    this.loopPlaylist = true;
    this.loopSong = false;
    this.loopSongSkip = false;
  }

  /**
  * Stops the audio player from looping either a song or the queue.
  */
  disableLoop() {
    this.loopSong = false;
    this.loopSongSkip = false;
    this.loopPlaylist = false;
  }

  /**
  * Pauses the audio player.
  */
  async pause() {
    await this.audioPlayer.pause();
  }

  /**
  * Resumes the audio player.
  */
  async resume() {
    await this.audioPlayer.unpause();
  }

  /**
  * Skips the song currently playing.
  */
  async skip() {
    if(this.loopSong)
      this.loopSongSkip = true; // We need to go to the next song.
    await this.audioPlayer.stop();

    // There is a skip
    this.isSkip = true;
  }

  /**
  * Adds a song to the end of the queue.
  * @param {Song}
  */
  async enqueue(song) {
    await this.queue.push(song); // Add the new song
    await this.processQueue();
  }

  /**
  * Adds a song to the start of the queue.
  * @param {Song}
  */
  async enqueueNext(song){
    await this.queue.unshift(song);
    await this.processQueue();
  }

  /**
  * Processes the audio queue and plays the next song.
  * The method also handles the looping of songs or playlists.
  */
  async processQueue() {

    // We are not in a position to play a song.
    if(this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle)
      return;

    logger.debug('Queue start');

    // Make sure we loop this... Duh
    this.queueLock = true;

    let isAttempt = false;
    let nextSong;

    // Check to see if the attempt timer is active.
    // It will in the event of a failed song play.
    // Note: Check for a manual skip.
    if(this.currentResorce && !this.isSkip && (this.currentResorce.playbackDuration < this.currentSong.duration / 2)) {

      logger.debug('The song finished too early :o');

      // See if there are remaining attempts to play the song.
      if(this.currentAttempt < this.songAttempts){
        this.currentAttempt += 1;
        nextSong = this.currentSong;
        isAttempt = true;
        logger.warn(`Attempting to play song ${this.currentAttempt}`);
      }
      // No more attempts.  Move tot he next song.
      else{
        logger.error('Song ran out of attempts to play.');
      }
    }

    // Reset the skip.
    this.isSkip = false;

    if(!isAttempt) {
      // This is a new song with new attempts.
      this.currentAttempt = 0;

      // Check if we should loop this song.
      if (this.loopSong && this.currentSong && !this.loopSongSkip) {
        nextSong = this.currentSong;
      } else {

        // Check to see if we have another song to play
        if(this.queue.length === 0){
          // The queue is empty.  Start the idle timer
          this.queueLock = false;
          this.currentSong = null;
          this.currentResorce = null;
          return await this.StartIdleTimer()
        }

        await this.clearIdleTimer();
        this.loopSongSkip = false;

        // Get the next song
        nextSong = this.queue.shift();
        logger.debug('Shift occured!');

        // Make sure to add the song back to the queue.
        if (this.loopPlaylist && this.currentSong)
          this.queue.push(this.currentSong);
      }
    }

    // Another song is in the queue.  Lets play it.
    try {

      // Create the song and add it to the channel
      const songResource = await nextSong.createAudioResource();
      songResource.volume.setVolume(this.volume);

      this.currentSong = nextSong;
      this.currentResorce = songResource;

      this.audioPlayer.play(songResource);
      this.queueLock = false;

    } catch(error) {

      // Something has gone wrong.
      logger.error(error);
      this.queueLock = false;
      await this.processQueue();
    }
  }

  /**
  * Starts a timer which disconnects the audio player.
  * This is used to ensure the bot does not sit idle for
  * to long.
  */
  async StartIdleTimer() {

    // Stop existing idle timers
    await this.clearIdleTimer();
    logger.debug('Starting idle timer.');

    // Start and store this timer.
    this.idleTimer = setTimeout(async () => {
      logger.debug('Idle timer finished.');
      const guildID = this.voiceConnection.joinConfig.guildId;
      await this.client.musicplayer.AnotherStop(guildID);
    }, 60_000 * 3);
  }

  /**
  * Clears the idle timer.  Called when a new song is addded
  * to the queue.
  */
  async clearIdleTimer() {
    if(this.idleTimer !== null)
      await clearTimeout(this.idleTimer);
  }
}

module.exports = AudioPlayer;
