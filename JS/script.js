console.log('Welcome to JavaScript');
// console.log(new Audio());
let currentSong = new Audio();   //This "new Audio" is used to get all <audio> files from HTML
let songs;
let currFolder;

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



async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let dummbydiv = document.createElement('div')
    dummbydiv.innerHTML = response
    let as = dummbydiv.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push((element.href.split(`/${folder}/`)[1]).replaceAll("%20", " ")) //gives values on index 1 after spliting

        }
    }

    return (songs);
}



const playMusic = (track, pause = false) => {
    // let audio = new Audio('/songs/' + track);
    currentSong.src = (`/${currFolder}/` + track)
    if (!pause) {
        currentSong.play()
        play.src = "svg/pause.svg"
    }

    document.querySelector(".discription").innerHTML = track;


}


async function displayAlbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let dummbydiv = document.createElement('div')
    dummbydiv.innerHTML = response
    let anchors = dummbydiv.getElementsByTagName('a')
    let albums = document.querySelector(".albums")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split('/').slice(-2)[0]);
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            albums.innerHTML = albums.innerHTML + `
            <div data-folder="${folder}" class="card">
            <img class="cover" width="100px" height="80px" src="songs/${folder}/cover.jpg" alt="">
            <div class="albumName">${response.title}</div>
        </div>`


        }
    }






    //Load playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)


            let heading = e.getAttribute('data-folder'); //getting the heading/title of card

            document.querySelector("h3").innerHTML = heading.charAt(0).toUpperCase() + heading.slice(1).replaceAll('%20', " ")

            document.querySelector(".playAll").style.display = "inline"

            document.querySelector(".bgtext").style.display = "none"

            document.querySelector('.left').style.left = "-200%"


            //Add song to SongList
            let ul = document.querySelector('.songList').getElementsByTagName('ul')[0]
            ul.innerHTML = " "
            for (let index = 0; index < songs.length; index++) {

                ul.innerHTML += `<li class="flex align-center">

                            <img src="svg/music.svg" alt="">

                            <div class="songInfo">
                                 <div>${songs[index]}</div>
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

            playMusic(songs[0], true)


        })


    })


}  //displayAlbum End bracket





async function main() {
    //get list of all songs 
    await getSongs(`songs/${currFolder}`)
    // console.log(songs);

    playMusic(songs[0], true)    //keep first song on track to play



    //Display Album
    displayAlbum()


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

    // Add Event Listener to previous song
    prev.addEventListener("click", (e) => {
        // console.log(currentSong);

        // console.log(songs.indexOf(currentSong.src.split('/').slice(-1)[0]));
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0].replaceAll('%20', " "));

        if ([index - 1] >= 0) {
            playMusic(songs[index - 1]);

        }
    })


    // Add Event Listener to next song
    document.querySelector("#next").addEventListener("click", (e) => {

        //to find the index of current song
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0].replaceAll('%20', " "));               //here [0] to extract isngle item from arrar

        if ([index + 1] < songs.length) {
            playMusic(songs[index + 1]);

        }
    })


    //Event listner for volume
    document.querySelector("#range").addEventListener('change', e => {

        let value = (e.target.value) / 100
        currentSong.volume = value

    })

    //Event listner for volume mute
    document.querySelector(".volumeBar > img").addEventListener("click", (e) => {
       
        if (e.target.src.includes("svg/volume.svg")) {
            e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg")
            currentSong.volume = 0
            document.querySelector('#range').value = 0
        }
        else {
            e.target.src = e.target.src.replace( "svg/mute.svg", "svg/volume.svg" )
            currentSong.volume = 0.2
            document.querySelector('#range').value = 20
        }

    })




    // Event listner for PLAY ALL and SHUFFLE MODE
    document.querySelector(".playAll").addEventListener("click", () => {

        play.src = "svg/pause.svg"

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
                shuffledSongs = shuffleArray(songs.slice())
                currentIndex = shuffledSongs.indexOf(songs[currentIndex]);
                document.querySelector(".shuffle").style.filter = "invert(100%)";
            }
            else {
                shuffledSongs = [];
                document.querySelector(".shuffle").style.filter = "invert(0%)";
            }
        }

        function toggleRepeatMode() {
            repeatMode = !repeatMode;
            if (repeatMode) {
                currentSong.loop = true
                document.querySelector(".repeat").style.filter = "invert(100%)"
            }
            else {
                currentSong.loop = false
                document.querySelector(".repeat").style.filter = "invert(0%)"; // Reset the filter to original
            }
        }

        function playCurrentSong() {
            if (shuffleMode) {
                currentSong.src = `/${currFolder}/` + shuffledSongs[currentIndex];
                currentSong.play();
                document.querySelector(".discription").innerHTML = shuffledSongs[currentIndex];
            }
            else {
                currentSong.src = `/${currFolder}/` + songs[currentIndex];
                currentSong.play();
                document.querySelector(".discription").innerHTML = songs[currentIndex];
            }

        }

        function nextSong() {
            if (shuffleMode) {
                currentIndex = (currentIndex + 1) % shuffledSongs.length;
                playCurrentSong();
            }
            else {
                currentIndex = (currentIndex + 1) % songs.length;
                playCurrentSong();
            }

        }

        function previousSong() {

            if (shuffleMode) {
                currentIndex = (currentIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
                playCurrentSong();
            }
            else {
                currentIndex = (currentIndex - 1 + songs.length) % songs.length;
                playCurrentSong();

            }
        }

        document.querySelector("#prev").addEventListener("click", previousSong);
        document.querySelector("#next").addEventListener("click", nextSong);

        document.querySelector(".shuffle").addEventListener("click", toggleShuffleMode);

        document.querySelector(".repeat").addEventListener("click", toggleRepeatMode);

        currentSong.addEventListener("ended", nextSong);

        playCurrentSong();
    });


    // Event listner for to open hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector('.left').style.left = "0"
    })

    // Event listner for to close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector('.left').style.left = "-200%"
    })




}

main()
