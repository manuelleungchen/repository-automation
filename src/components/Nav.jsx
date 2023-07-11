import { NavLink } from 'react-router-dom'

// Import styles
import styles from "./Nav.module.css";

function Nav() {
    return (
        <div className="container">
            <div className={styles.linksContainer}>
                    <NavLink to="/" className={({ isActive }) =>
                        isActive ? styles.activeNavLink : styles.navLink
                    }>Run Scripts</NavLink>
                    <NavLink to="/clone" className={({ isActive }) =>
                        isActive ? styles.activeNavLink : styles.navLink
                    }>Clone Repos</NavLink>
            </div>
        </div>
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

export default Nav