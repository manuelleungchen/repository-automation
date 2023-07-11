// import { NavLink } from 'react-router-dom'

// Import images
import logo from '../assets/img/logo.png';

// Import styles
import styles from "./Header.module.css";

function Header() {
    return (
        <header className="container">
            <div className={styles.appName}>
                <img src={logo} width={50} alt="logo" />
                <h1>Repository Automation</h1>
            </div>
        </header>
        // <header className="container">
        //     <div className={styles.appName}>
        //         <img src={logo} width={50} alt="logo" />
        //         <h1>Repository Automation</h1>
        //     </div>
        //     <div className={styles.linksContainer}>
        //         <NavLink to="/" className={({ isActive }) =>
        //             isActive ? styles.activeNavLink : styles.navLink
        //         }>Run Scripts</NavLink>
        //         <NavLink to="/clone" className={({ isActive }) =>
        //             isActive ? styles.activeNavLink : styles.navLink
        //         }>Clone Repos</NavLink>
        //     </div>
        // </header>
    )
}

export default Header