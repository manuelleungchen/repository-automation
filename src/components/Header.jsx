import { NavLink } from 'react-router-dom'

// Import images
import logo from '../assets/img/logo.png';

// Import styles
import styles from "./Header.module.css";

// Import components
import ConnectionStatusBar from './ConnectionStatusBar';
import Settings from './Settings';

function Header() {
    return (
        <header className="container">
            <div className={styles.appName}>
                <img src={logo} width={50} alt="logo" />
                <h1>Repository Automation</h1>
            </div>
            <ConnectionStatusBar />
            <Settings />

            <nav>
                <div className={styles.linksContainer}>
                    <NavLink to="/" className={({ isActive }) =>
                        isActive ? styles.activeNavLink : styles.navLink
                    }>Run Scripts</NavLink>
                    <NavLink to="/clone" className={({ isActive }) =>
                        isActive ? styles.activeNavLink : styles.navLink
                    }>Clone Repos</NavLink>
                </div>
            </nav>
        </header>
    )
}

export default Header