/*
TODO: 
⬜ 
🔄 DOING:
✅ DONE:
    ✅ DONE: Karakter: E
        - Skal inneholde et innloggingsskjema (uten krav til reell funksjonalitet). 

    ✅ DONE: Karakter: D
        - Ikke relevant

    ✅ DONE: Karakter: C
        - Innloggingsskjema (ikke funksjonalitet - backend)
        - Når brukeren fyller ut skjemaet og "logger inn", skal:
                Innloggingsskjemaet skjules
                En ny visning vises med overskriften "Min side"
        - Påloggingsstatusen kan håndteres ved hjelp av en state-variabel (f.eks. isLoggedIn), som endres fra false til true når brukeren sender inn skjemaet.

    🔄 DOING: Karakter: B
        - På Dashboard-siden skal følgende vises:
            En oversikt over alle events lagret i Sanity
            En oversikt over alle brukere
            
            For hver bruker skal det vises:
                Navn og profilbilde
                En opptelling av events brukeren har i ønskelisten og tidligere kjøp
                En liste over disse eventene
    
    🔄 DOING: Karakter: A
        - På Dashboard-siden skal innholdet være delt opp i to tydelige seksjoner:

        1. Brukerinformasjon ✅ DONE:
        Viser kun informasjon om den innloggede brukeren (f.eks. navn, e-post, bilde, alder)
        
        2. Brukerens innhold
        Ønskeliste og tidligere kjøp
        
        Vis en opplisting av events fra både ønskelisten og tidligere kjøp, hentet fra brukerens tilknyttede data i Sanity.
        Hver event skal vises som et kort, med informasjon hentet fra Ticketmaster API:
        Navn på eventet
        Dato
        Bilde

        Venner-funksjonalitet:
        Oppdater brukerens Sanity-modell ved å legge til et nytt felt: friends
        Dette skal være en referanse til én eller flere andre brukere i systemet.
        I grensesnittet skal du hente ut og vise vennelisten til den innloggede brukeren.
        
        Felles arrangementer:
        Under hver venn i visningen, skal det kontrolleres om brukeren og vennen har felles events i ønskelisten.
        Dersom det finnes et eller flere felles arrangementer, skal det vises en melding som for eksempel:
        "Du og [Navn] har samme event i ønskelisten – hva med å dra sammen på [Eventnavn]?"
    
    
*/

import React, { useState, useEffect } from "react";
import "../styles/dashboardStyle.scss";
import { fetchAllUsers, fetchUserById } from "../sanity/userServices"; // Import fetch functions
import DummyPerson from "../assets/person-dummy.jpg";

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem("isLoggedIn") === "true";
    });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [loading, setLoading] = useState(false); // State to handle loading
    
    useEffect(() => {
        const fetchLoggedInUser = async () => {
            const userId = localStorage.getItem("loggedInUserId");
            if (userId) {
                setLoading(true); // Start loading
                try {
                    const user = await fetchUserById(userId);
                    setLoggedInUser(user);
                } catch (error) {
                    console.error("Error fetching logged-in user:", error);
                } finally {
                    setLoading(false); // Stop loading
                }
            }
        };

        if (isLoggedIn) {
            fetchLoggedInUser();
        }
    }, [isLoggedIn]);

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const allUsers = await fetchAllUsers();
            const user = allUsers.find((u) => u.email === email);

            if (user) {
                if (password === user.password) {
                    setTimeout(() => { // Simulate delay
                        setIsLoggedIn(true);
                        setLoggedInUser(user);
                        window.location.reload(); // Reload the page to reflect changes
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("loggedInUserId", user._id);
                        setError("");
                        setLoading(false); // Stop loading
                    }, 1000); // 1-second delay
                } else {
                    setError("Feil passord. Prøv igjen.");
                    setLoading(false); // Stop loading
                }
            } else {
                setError("Bruker ikke funnet. Sjekk e-postadressen.");
                setLoading(false); // Stop loading
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError("Noe gikk galt. Prøv igjen senere.");
            setLoading(false); // Stop loading
        }
    };
    // Handle logout
    const handleLogout = () => {
        setEmail();
        setPassword();
        setLoading(true); // Start loading
        setTimeout(() => { // Simulate delay
            setIsLoggedIn(false);
            setLoggedInUser(null);
            window.location.reload(); // Reload the page to reflect changes
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUserId");
            setLoading(false); // Stop loading
        }, 500); // 0.5-second delay
    };
    // Function to find common wishlist items between two users
    const findCommonWishlistItems = (friendWishlist) => {
        if (!loggedInUser || !friendWishlist) return []; // Return empty array if no user or wishlist
        const loggedInUserWishlist = loggedInUser.wishlist || []
        return loggedInUserWishlist.filter((item) =>
            friendWishlist.some((friendItem) => friendItem._id === item._id)
        );
    };
    // Loading spinner
    if (loading) {
        return <div className="loading-spinner"><div className="spinner"></div><p>Laster inn...</p></div>;
    }

    return (
        <div id="dashboard-page">{!isLoggedIn ? (
                <section id="login-section">
                    <span><i className="fas fa-sign-in-alt"></i></span>
                    <h1>Velkommen tilbake!👋 </h1>
                    <form onSubmit={handleLogin}>
                        <div className="input-wrapper">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                id="email"
                                placeholder="E-post"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-wrapper">
                            <i className="fas fa-lock"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Passord"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                id="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <i className="fa-regular fa-eye"></i>
                                ) : (
                                    <i className="fa-regular fa-eye-slash"></i>
                                )}
                            </button>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button id="login" type="submit">Logg inn</button>
                    </form>
                </section>
            ) : (
                <section id="dashboard-section">
                    <section id="dashboard-header">
                        <h1>Min side</h1>
                        <button id="logout" onClick={handleLogout} aria-label="Logg ut" title="Logg ut">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </section>

                    {/* User Information */}
                    <section id="user-info-section">
                        {loggedInUser && (
                            <article id="user-details">
                                <img
                                    src={loggedInUser.photo?.asset?.url || "https://placehold.co/400x400"}
                                    alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`}
                                />
                                <aside>
                                    <h3>{`${loggedInUser.firstName} ${loggedInUser.lastName}`}</h3>
                                    <p>E-post: {loggedInUser.email}</p>
                                    <p>Alder: {loggedInUser.age}</p>
                                </aside>
                            </article>
                        )}
                    </section>

                    <section id="user-content-section">
                        <section id="user-friends-section">
                            <h2>Venner av deg</h2>
                            {loggedInUser?.friends?.length > 0 ? (
                                <ul id="friends-list">
                                {loggedInUser.friends.map((friend) => {
                                    const commonWishlistItems = findCommonWishlistItems(friend.wishlist);
                                    return (
                                        <li key={friend._id} className="friend-card">
                                            <img
                                                src={friend.photo?.asset?.url || DummyPerson}
                                                alt={`${friend.firstName} ${friend.lastName}`}
                                            />
                                            <h3>{`${friend.firstName} ${friend.lastName}`}</h3>
                                            {commonWishlistItems.length > 0 ? (
                                                <section className="user-friends-interest">
                                                    <p>Du og {friend.firstName} ønsker å dra på samme event. Hva med å dra sammen?:</p>
                                                    <ul>
                                                        {commonWishlistItems.slice(0, 3).map((item) => (
                                                            <li key={item._id}>
                                                                <p>{item.title}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            ) : (
                                                <p>Ingen felles interesser funnet i ønskelisten.</p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            ) : (
                                <p>Du har ikke lagt til noen venner.</p>
                            )}
                        </section>
                        <section id="user-purchases-section">
                            {loggedInUser && (
                                <article id="previous-purchases">
                                    <h2>Tidligere kjøp</h2>
                                    <ul id="previous-purchases-list">
                                        {loggedInUser.previousPurchases?.map((event) => (
                                            <li key={event._id}>
                                                <img
                                                    src={event.image || "https://placehold.co/400x400"}
                                                    alt={event.name}
                                                />
                                                <p>{event.name}</p>
                                                <p>{event.date}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            )}
                        </section>
                        <section id="user-wishlist-section">
                            {loggedInUser && (
                                <article id="wishlist">
                                    <h2>Ønskeliste</h2>
                                    <ul id="wishlist-list">
                                        {loggedInUser.wishlist?.map((event) => (
                                            <li key={event._id}>
                                                <img
                                                    src={event.image} // ADD: || "https://placehold.co/400x400" or something
                                                    alt={event.name}
                                                />
                                                <p>{event.name}</p>
                                                <p>{event.date}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            )}
                        </section>
                    </section>

                </section>
            )}
        </div>
    );
}