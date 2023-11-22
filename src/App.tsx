import './App.css';
import LoadingIndicator from './components/LoadingIndicator';
import YoutubeEmbed from './components/YoutubeEmbed';
import { useState, useEffect } from 'react';
import { trackPromise } from 'react-promise-tracker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DiGithubBadge } from 'react-icons/di';

function App() {
    // Setup states.
    const [list, setList] = useState<Picture[]>([]);
    const [liked, setLiked] = useState<string[]>([]);
    const [daysAgo, setDaysAgo] = useState<number>(10);

    useEffect(() => {
        // Get the liked posts from localStorage.
        const likedLocalStorage = localStorage.getItem("liked");
        const likedParsed = likedLocalStorage ? JSON.parse(likedLocalStorage) : [];
        setLiked(likedParsed);

        // Fetch images from the NASA APOD API.
        queryRange(getDaysAgo(10), getCurrentDate());
    }, []);

    return (
        <div className="App">
            <header>
                <span className="logo">Spacestagram</span>
                <a href="https://github.com/somtooriaku/spacestagram" className="icon"><DiGithubBadge /></a>
            </header>
            <div className="content">
                <div className="cards">
                    {list.map((item) => {
                        // Setup a constant for if the item is liked or not.
                        const isLiked = liked.includes(item.date);

                        // Display a card.
                        return (
                            <div className="card">
                                {/* Show a youtube embed if the item type is "video" */}
                                {item.media_type === "video" ? <YoutubeEmbed  url={item.url} /> : <img src={item.url} alt={item.title} /> }
                                <div className="card-container">
                                    <h3>{item.title}</h3>
                                    <p className="copyright">
                                        {item.copyright ? item.date + " - " + item.copyright : item.date}
                                    </p>
                                    <p>{item.explanation}</p>
                                    <div className="buttons">
                                        <button className="button" onClick={() => share(item)}>Share</button>
                                        <button
                                            className={ isLiked ? "liked button" : "button" }
                                            onClick={() => {
                                                if (isLiked) {
                                                    unlike(item)
                                                } else {
                                                    like(item)
                                                }
                                            }}
                                        >
                                            { isLiked ? "Unlike"  :  "Like"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button className="button" onClick={() => {
                    queryRange(getDaysAgo(daysAgo + 10), getCurrentDate());
                    setDaysAgo((prevState) => prevState + 10)
                }}>
                    Load More
                </button>
                <LoadingIndicator />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    />
            </div>
        </div>
    );

    /**
     * Get the curreny system date.
     */
    function getCurrentDate() {
        let d = new Date();
        let date = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        return `${year}-${month<10?`0${month}`:`${month}`}-${date}`
    }

    /**
     * Get the ISO date string from `x` number of days ago.
     *
     * @param {days: number} The number of days ago to fetch the date string for.
     */
    function getDaysAgo(days: number) {
        let d = new Date();
        d.setDate(d.getDate() - days);
        let date = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        return `${year}-${month<10?`0${month}`:`${month}`}-${date}`
    }

    /**
     * Share the hdurl of the APOD and show a toast saying it has been copied.
     *
     * @param {picture: Picture} The picture to be shared.
     */
    function share(picture: Picture) {
        let shareUrl = "";

        if (picture.media_type === "image") {
            shareUrl = picture.hdurl;
        } else {
            shareUrl = picture.url;
        }

        navigator.clipboard.writeText(shareUrl);
        toast.dark('Copied link to clipboard', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    /**
     * Like an image by adding it to the list of liked images.
     *
     * @param {picture: Picture} The picture to be liked.
     */
    function like(picture: Picture) {
        setLiked((prevState) => {
            let newState = [ ...prevState, picture.date ];
            localStorage.setItem("liked", JSON.stringify(newState));
            console.log(newState)
            return newState;
        });
    }


    /**
     * Unlike an image by adding it to the list of liked images.
     *
     * @param {picture: Picture} The picture to be unliked.
     */
    function unlike(picture: Picture) {
        setLiked((prevState) =>  {
            let newState = [ ...(prevState.filter(item => item !== picture.date)) ]
            localStorage.setItem("liked", JSON.stringify(newState));
            console.log(newState)
            return newState;
        });
    }

    /**
     * Query the NASA APOD api for the images and their descriptions.
     *
     * @param {startDate: string} The first day to get the range of images from.
     * @param {endDate: string} The last day to get the range of images from.
     */
    function queryRange(startDate: string, endDate: string) {
        trackPromise(
            fetch( "https://api.nasa.gov/planetary/apod?api_key=XSPgDz48OzDrdgfz5ACZThYxHvY7IwyUWFYbClbH&start_date=" + startDate + "&end_date=" + endDate,
                {
                    "method": "GET",
                })
            .then(response => response.json())
            .then(response => {
                setList(response.reverse());
                console.log(response);
            }));
    }
}

interface Picture  {
    copyright: string;
    date: string;
    explanation: string;
    hdurl: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
}

export default App;
