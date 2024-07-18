console.log('Welcome to JavaScript');
// console.log(new Audio());
let currentSong = new Audio();   //This "new Audio" is used to get all <audio> files from HTML

let songList


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text()
    let dummbydiv = document.createElement('div')
    dummbydiv.innerHTML = response
    let as = dummbydiv.getElementsByTagName('a')
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("3000/")[1]) //gives values on index 1 after spliting
        }
    }
    return (songs);
}



const playMusic = (track, pause = false) => {
    // let audio = new Audio('/songs/' + track);
    currentSong.src = ('/songs/' + track)
    if (!pause) {
        currentSong.play()
        play.src = "svg/pause.svg"
    }
    document.querySelector(".discription").innerHTML = track;
}


async function main() {
    //get list of all songs 
    let songs = await getSongs()
    // console.log(songs);

    songList = []
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index].replaceAll("%20", " ");
        songList.push(element)
    }

    playMusic(songList[0], true)    //keep first song on track to play



    //Add song to SongList
    let ul = document.querySelector('.songList').getElementsByTagName('ul')[0]
    for (let index = 0; index < songList.length; index++) {

        ul.innerHTML += `<li class="flex align-center">

                            <img src="svg/music.svg" alt="">

                            <div class="songInfo">
                                 <div>${songList[index]}</div>
                                 <div>Nimesh</div>
                            </div>

                            <div class=" playNow flex align-center">Play Now
                            <img src="svg/playnow.svg" alt="">
                            </div>
                        </li>`
    }

    //Attach event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener('click', () => {
            // console.log(e.querySelector(".songInfo").getElementsByTagName('div')[0].innerHTML)

            playMusic(e.querySelector(".songInfo").getElementsByTagName('div')[0].innerHTML)



        })
    })



    //Attach event listner to play & pause song in musicController Bar
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svg/pause.svg"

        }
        else {
            currentSong.pause()
            play.src = "svg/playbutton.svg"
        }
    })


    //Listen for "timeupdate" event
    currentSong.addEventListener('timeupdate', () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        let songTime = secondsToMinutesSeconds(currentSong.currentTime)
        document.querySelector(".currentDuration").innerHTML = songTime


        let totalDuration = secondsToMinutesSeconds(currentSong.duration)
        document.querySelector(".totalDuration").innerHTML = totalDuration

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Event Listener to seekBar
    document.querySelector(".seekBar").addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left =
            percent + "%";  //here .target is used to locate the that class which is selected through queryselector
        currentSong.currentTime = (percent * currentSong.duration) / 100

    })


    prev.addEventListener("click", (e) => {
        // console.log(currentSong);

        // console.log(songList.indexOf(currentSong.src.split('/').slice(-1)[0]));
        let index = songList.indexOf(currentSong.src.split('/').slice(-1)[0].replaceAll('%20', " "));

        if ([index - 1] >= 0) {
            playMusic(songList[index - 1]);

        }
    })


    // Add Event Listener to next song
    document.querySelector("#next").addEventListener("click", (e) => {

        //to find the index of current song
        let index = songList.indexOf(currentSong.src.split('/').slice(-1)[0].replaceAll('%20', " "));               //here [0] to extract isngle item from arrar

        if ([index + 1] < songList.length) {
            playMusic(songList[index + 1]);

        }
    })


    //Event listner for volume
    document.querySelector("#range").addEventListener('change', e => {

        let value = (e.target.value) / 100
        currentSong.volume = value

    })


    // Event listner for PLAY ALL and SHUFFLE MODE
    document.querySelector(".playAll").addEventListener("click", () => {

        let shuffleMode = false
        let repeatMode = false;
        let shuffledSongs = [];
        let currentIndex = 0;

        function shuffleArray(array) {
            let currentIndex = array.length, randomIndex;

            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
        }

        function toggleShuffleMode() {
            shuffleMode = !shuffleMode
            if (shuffleMode) {
                shuffledSongs = shuffleArray(songList.slice())
                currentIndex = shuffledSongs.indexOf(songList[currentIndex]);
                document.querySelector("#shuffle").style.filter = "invert(100%)";
            }
            else {
                shuffledSongs = [];
                document.querySelector("#shuffle").style.filter = "invert(0%)";
            }
        }

        function toggleRepeatMode() {
            repeatMode = !repeatMode;
            if (repeatMode) {
                currentSong.loop=true
                document.querySelector("#repeat").style.filter = "invert(100%)"
            }
            else {
                currentSong.loop=false          
                document.querySelector("#repeat").style.filter = "invert(0%)"; // Reset the filter to original
            }
        }

        function playCurrentSong() {
            if (shuffleMode) {
                currentSong.src = '/songs/' + shuffledSongs[currentIndex];
                currentSong.play();
                document.querySelector(".discription").innerHTML = shuffledSongs[currentIndex];
            }
            else {
                currentSong.src = '/songs/' + songList[currentIndex];
                currentSong.play();
                document.querySelector(".discription").innerHTML = songList[currentIndex];
            }

        }

        function nextSong() {
            if (shuffleMode) {
                currentIndex = (currentIndex + 1) % shuffledSongs.length;
                playCurrentSong();
            }
            else {
                currentIndex = (currentIndex + 1) % songList.length;
                playCurrentSong();
            }

        }

        function previousSong() {

            if (shuffleMode) {
                currentIndex = (currentIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
                playCurrentSong();
            }
            else {
                currentIndex = (currentIndex - 1 + songList.length) % songList.length;
                playCurrentSong();

            }
        }

        document.querySelector("#prev").addEventListener("click", previousSong);
        document.querySelector("#next").addEventListener("click", nextSong);

        document.querySelector("#shuffle").addEventListener("click", toggleShuffleMode);

        document.querySelector("#repeat").addEventListener("click", toggleRepeatMode);

        currentSong.addEventListener("ended", nextSong);

        playCurrentSong();
    });







}

main()
