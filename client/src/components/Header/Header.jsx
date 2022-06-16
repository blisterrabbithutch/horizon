import React, { useEffect, useState, useContext } from "react";
import classes from "./Header.module.scss";
import variables from '../../styles/variables.scss';
import metamaskIcon from '../../metamask.svg'
import { Context } from "../../App";

const Header = () => {
  const {web3, accounts} = useContext(Context);
  const [currentAccount, setCurrentAccount] = useState();

  useEffect(() => {
    if (!web3 || !accounts) return;

    const connectToWeb3 = async () => {
      try {
        setCurrentAccount(accounts[0]);
      } catch (e) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
        console.error(e);
      }
    }

    connectToWeb3();
  }, [web3, accounts]);

  const returnResponsiveAddress = () => {
    if (!currentAccount) return;
    const pageWidth = document.documentElement.clientWidth;
    if (pageWidth < variables.mobile_responsive_breakpoint) {
      setCurrentAccount(`...${accounts[0].slice(-5)}`);
    } else {
      setCurrentAccount(accounts[0]);
    }
  }

  useEffect(() => {
    returnResponsiveAddress();
    window.addEventListener('resize', returnResponsiveAddress);
    return () => {
      window.removeEventListener('resize', returnResponsiveAddress);
    }
  }, [currentAccount])

  return (
    <div className={classes.wrapper}>
      <div className={classes.title}>horizon</div>
      {currentAccount && (
        <div className={classes.accountBlock}>
          <span className={classes.accoutValue}>{currentAccount}</span>
          <img src={metamaskIcon} alt="MM icon" className={classes.icon} />
        </div>
      )}
    </div>
  )
}

export default Header;
