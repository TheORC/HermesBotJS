const ytdlex = require('youtube-dl-exec');

const { AudioResource, createAudioResource, demuxProbe } = require(`@discordjs/voice`);

class Song {

  constructor(url, title, duration, requester){

    // Info about this song
    this.url = url;
    this.title = title;
    this.requester = requester;
    this.duration = duration;
  }

  async createAudioResource() {
    return new Promise((resolve, reject) => {

      // Get info from YouTube
      const process = ytdlex.exec(this.url,
          				{ o: '-', q: '', f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio', r: '100K',},
          				{ stdio: ['ignore', 'pipe', 'ignore'] },
          			);

      // Check if an output stream was created.
      if(!process.stdout){
        reject(new Error('No stdout'));
      }

      // Get our stream
      const stream = process.stdout;

      // Create a method in case of an error.
      const onError = (error) => {
        if(!process.killed) process.kill();
        stream.resume();
        reject(error);
      }

      process.once('spawn', () => {
        demuxProbe(stream).then((probe) => {
          resolve(createAudioResource(probe.stream, {
              metadata: this,
              inputType: probe.type,
              inlineVolume: true
          }));
        }).catch(onError);
      }).catch(onError);
    });
  }
}

module.exports = Song;
