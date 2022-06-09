import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Paper, Tab, Tabs, Box, Grid, FormControl, OutlinedInput, InputAdornment } from "@material-ui/core";

import "./presale.scss";
import { addresses, POOL_GRAPH_URLS } from "../../constants";
import { useWeb3Context } from "../../hooks";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { getPoolValues, getRNGStatus } from "../../slices/PoolThunk";
import { swapToken2ETH, swapETH2Token, changeHiroApproval, changeETHApproval, redeem } from "../../slices/Presale";
import { trim } from "../../helpers/index";
import { Typography, Button, Zoom } from "@material-ui/core";
import { error, info } from "../../slices/MessagesSlice";
import { PresaleCard } from "./PresaleCard";

function a11yProps(index) {
  return {
    id: `pool-tab-${index}`,
    "aria-controls": `pool-tabpanel-${index}`,
  };
}

const MAX_DAI_AMOUNT = 100;

const Swap = () => {
  const [view, setView] = useState(0);

  const changeView = (event, newView) => {
    setView(newView);
  };

  // NOTE (appleseed): these calcs were previously in PoolInfo, however would be need in PoolPrize, too, if...
  // ... we ever were to implement other types of awards
  const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
  const dispatch = useDispatch();
  let history = useHistory();
  const [walletChecked, setWalletChecked] = useState(false);
  const [winners, setWinners] = useState("--");
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [cstpBalance, setCSTPBalance] = useState(0);
  const [inputETHAmount, setBUSDBalance] = useState(0);
  const [directionETH2HIRO, setDirectionETH2HIRO] = useState(true);
  const [hasAllowance, setHasAllowance] = useState(false);
  
  const curHiroBalance = useSelector(state => {
    return state.account.balances && state.account.balances.hiroBalance;
  }) | 0;

  const curETHBalance = useSelector(state => {
    return state.account.balances && state.account.balances.ethBalance;
  });

  const hiroSwapAllowance = useSelector(state => {
    return state.account.balances && state.account.balances.hiroSwapAllowance;
  });

  const ethSwapAllowance = useSelector(state => {
    return state.account.balances && state.account.balances.ethSwapAllowance;
  });

  const cstInCirculation = useSelector(state => {
    return state.account.balances && state.account.balances.cstInCirculation;
  });

  const cstpTotalSupply = useSelector(state => {
    return state.account.balances && state.account.balances.cstpTotalSupply;
  });

  const poolBalance = useSelector(state => {
    return state.account.balances && state.account.balances.pool;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const tokenPriceInBNB = useSelector(state => {
    return state.app.priceInBNB;
  });

  const cstPurchaseBalance = useSelector(state => {
    return state.account.presale && state.account.presale.cstPurchaseBalance;
  }) | 0;

  let cstpPrice;

  const setHIROBalanceCallback = (value) => {
    cstpPrice = tokenPriceInBNB? tokenPriceInBNB : 0;
    setCSTPBalance(value);
    setBUSDBalance(Number(Number(value * cstpPrice).toFixed(3)));
  }

  const setETHBalanceCallback = (value) => {
    cstpPrice = tokenPriceInBNB? tokenPriceInBNB : 0;
    setBUSDBalance(value);
    setCSTPBalance(Number(Number(value / cstpPrice).toFixed(3)));
  }

  const setSwapDirectionCallback = () => {
    if (directionETH2HIRO == true){
      setDirectionETH2HIRO(false);
    }else{
      setDirectionETH2HIRO(true);
    }
  }

  useEffect(() => {
    if ( directionETH2HIRO && ethSwapAllowance > 0) {
      setHasAllowance(true);
    }else if (!directionETH2HIRO && hiroSwapAllowance > 0){
      setHasAllowance(true);
    }else {
      setHasAllowance(false);
    }

  }, [hasAllowance, hiroSwapAllowance, ethSwapAllowance, directionETH2HIRO]);

  const onPurchaseCST = async action => {
    cstpPrice = tokenPriceInBNB? tokenPriceInBNB : 0;
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(inputETHAmount) || inputETHAmount === 0 || inputETHAmount === "" || !inputETHAmount) {
      // eslint-disable-next-line no-alert
      return dispatch(info("Please enter a value!"));
    }

    console.log("inputETHAmount", inputETHAmount);
    console.log("inputcsptAmount", cstpBalance);
    if (directionETH2HIRO == false) {
      if (curHiroBalance > cstpBalance){
        await dispatch(swapToken2ETH({ amount: cstpBalance, provider, address, networkID: chainID }));
      } else {
        await dispatch(info("Your Hiro balance is smaller than input amount!"));
      }
    }
    else {
      if( curETHBalance >= inputETHAmount) {
        await dispatch(swapETH2Token({ amount: inputETHAmount, provider, address, networkID: chainID }));
      } else {
        await dispatch(info("Your ETH balance is smaller than input amount!"));
      }
    }
    setHIROBalanceCallback(0);
  };

  console.log('MAX_DAI_AMOUNT - cstPurchaseBalance * cstpPrice', cstPurchaseBalance);

  const onClaim = async action => {
    // eslint-disable-next-line no-restricted-globals
    await dispatch(redeem({ provider, address, networkID: chainID }));
  };

  const onSeekApproval = async token => {

    if(directionETH2HIRO == true){
      await dispatch(changeETHApproval({ address, provider, networkID: chainID }));
    }
    else{
      await dispatch(changeHiroApproval({ address, provider, networkID: chainID }));
    }
  };

  useEffect(() => {
    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        setWalletChecked(true);
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }
  }, []);

  // this useEffect fires on state change from above. It will ALWAYS fire AFTER
  useEffect(() => {
    // don't load ANY details until wallet is Checked
    if (walletChecked) {
      dispatch(getPoolValues({ networkID: chainID, provider: provider }));
      dispatch(getRNGStatus({ networkID: chainID, provider: provider }));
    }
  }, [walletChecked]);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Swap
    </Button>,
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "buy_presale") | !hasAllowance}
      onClick={() => {
        onPurchaseCST();
      }}
    >
      {txnButtonText(pendingTransactions, "buy_presale", "Confirm Swap")}
    </Button>
  )

  modalButton.push(
    <Button
      className="stake-button"
      variant="contained"
      color="primary"
      disabled={isPendingTxn(pendingTransactions, "approve_presale") | hasAllowance}
      onClick={() => {
        onSeekApproval();
      }}
    >
      {txnButtonText(pendingTransactions, "approve_presale", "Approve Swap")}
    </Button>
  )

  return (
    <Zoom in={true} style={{paddingTop: "100px", marginLeft: "auto", marginRight: "auto", width: "80%"}}>
      <div id="pool-together-view">
        <PresaleCard
          address={address}
          cstPurchaseBalance={cstPurchaseBalance}
          cstpPrice={tokenPriceInBNB}
          cstpTotalSupply={cstpTotalSupply}
          cstInCirculation={cstInCirculation}
          cstpBalance={cstpBalance}
          inputETHAmount={inputETHAmount}
          modalButton={modalButton}
          // hasAllowance={hasAllowance}
          curETHBalance={curETHBalance}
          curHiroBalance={curHiroBalance}
          setHIROBalanceCallback={setHIROBalanceCallback}
          setETHBalanceCallback={setETHBalanceCallback}
          setSwapDirectionCallback={setSwapDirectionCallback}
          directionETH2HIRO={directionETH2HIRO}
        />
      </div >
    </Zoom>
  );
};

export default Swap;
