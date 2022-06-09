import { useCallback, useState } from "react";
import { AppBar, Toolbar, Box, Button, SvgIcon, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ReactComponent as MenuIcon } from "../../assets/icons/hamburger.svg";
import OhmMenu from "./OhmMenu.jsx";
import ThemeSwitcher from "./ThemeSwitch.jsx";
import ConnectMenu from "./ConnectMenu.jsx";
import "./topbar.scss";
import LogoImg from '../../assets/icons/olympus-nav-header.png'
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as ZapIcon } from "../../assets/icons/zap.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { NavLink } from "react-router-dom";
import Social from "../Sidebar/Social";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      padding: "10px",
    },
    justifyContent: "flex-end",
    alignItems: "flex-end",
    background: "transparent",
    backdropFilter: "none",
    zIndex: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("981")]: {
      display: "none",
    },
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "20px",
  },
  logoTitle: {
    fontFamily: "Black Han Sans, Sans-serif",
    color: "white",
    fontSize: "1rem",
    paddingLeft: "15px",
  },
  buttonProp: {
    paddingLeft: "50px",
  }
}));

function TopBar({ theme, toggleTheme, handleDrawerToggle }) {
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [isActive] = useState();

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("resourcelist") >= 0 && page === "resourcelist") {
      return true;
    }
    if (currentPath.indexOf("governancelist") >= 0 && page === "governancelist") {
      return true;
    }
    if (currentPath.indexOf("finance") >= 0 && page === "finance") {
      return true;
    }
    if (currentPath.indexOf("swap") >= 0 && page === "swap") {
      return true;
    }
    if (currentPath.indexOf("Presale") >= 0 && page === "Presale") {
      return true;
    }
    if (currentPath.indexOf("calculator") >= 0 && page === "calculator") {
      return true;
    }
    if (currentPath.indexOf("nft") >= 0 && page === "nft") {
      return true;
    }
    if ((currentPath.indexOf("bonds") >= 0 || currentPath.indexOf("choose_bond") >= 0) && page === "bonds") {
      return true;
    }
    return false;
  }, []);

  const ButtonGroup = () => {
    return (
      <>
      {isSmallScreen ? <div> </div> : 
      <div className={classes.logo}>
        <img src={LogoImg} alt="" style={{ height: "50px", borderRadius: "50%" }} />
        <span className={classes.logoTitle}>Hirokage.app</span>
        <div style={{ display: "flex", justifyContent: "space-between", width: "70%" }}>
          <Link
            component={NavLink}
            id="dash-nav"
            to="/dashboard"
            isActive={(match, location) => {
              return checkPage(match, location, "dashboard");
            }}
            className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h6" className={classes.buttonProp} >
              Dashboard
            </Typography>
          </Link>

          <Link
            component={NavLink}
            id="stake-nav"
            to="/stake"
            isActive={(match, location) => {
              return checkPage(match, location, "stake");
            }}
          // className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h6" className={classes.buttonProp}>
              Staking
            </Typography>
          </Link>

          {/* <Link
            component={NavLink}
            id="stake-nav"
            to="/resourcelist"
            isActive={(match, location) => {
              return checkPage(match, location, "resourcelist");
            }}
          // className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h6" className={classes.buttonProp}>
              DAO
            </Typography>
          </Link>
          <Link
            component={NavLink}
            id="stake-nav"
            to="#"
            isActive={(match, location) => {
              return checkPage(match, location, "#");
            }}
          // className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h6" className={classes.buttonProp}>
              Incubator
            </Typography>
          </Link>
          <Link
            component={NavLink}
            id="stake-nav"
            to="/swap"
            isActive={(match, location) => {
              return checkPage(match, location, "swap");
            }}
          // className={`button-dapp-menu ${isActive ? "active" : ""}`}
          >
            <Typography variant="h6" className={classes.buttonProp}>
              Swap
            </Typography>
          </Link> */}
        </div>
      </div>
      }
    </>
    );
  };

  return (
    <AppBar position="sticky" className={classes.appBar} elevation={0}>
      <Toolbar disableGutters className="dapp-topbar">
        <Button
          id="hamburger"
          aria-label="open drawer"
          edge="start"
          size="large"
          variant="contained"
          color="secondary"
          onClick={handleDrawerToggle}
          className={classes.menuButton}
        >
          <SvgIcon component={MenuIcon} />
        </Button>
        <Box display="flex" justifyContent="space-between" width="100%">
          <ButtonGroup/>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Social />
            <ConnectMenu theme={theme} />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
