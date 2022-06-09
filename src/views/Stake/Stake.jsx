import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  FormLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getOhmTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake, claimReward } from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers } from "ethers";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sOhmImg = getTokenImage("sohm");
const ohmImg = getOhmTokenImage(16, 16);

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const [quantity, setQuantity] = useState("");

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useSelector(state => {
    return state.app.fiveDayRate;
  });
  const kageBalance = useSelector(state => {
    return state.account.staking && state.account.staking.kageBalance;
  });
  const oldSohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.oldsohm;
  });
  const stakedBalance = useSelector(state => {
    return state.account.staking && state.account.staking.stakedBalance;
  });
  const fsohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.fsohm;
  });
  const wsohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.wsohm;
  });
  const kageAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.kageAllowance;
  });

  const kageEarned = useSelector(state => {
    return state.account.staking && state.account.staking.kageEarned;
  });

  const unstakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.ohmUnstake;
  });
  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const stakingAPY = useSelector(state => {
    return state.account.staking && state.account.staking.rewardRate;
  });
  const stakingTVL = useSelector(state => {
    return state.account.staking && state.account.staking.totalStaked;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(kageBalance);
    } else {
      setQuantity(stakedBalance);
    }
  };

  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "" || !quantity) {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(kageBalance, "gwei"))) {
      return dispatch(error("You cannot stake more than your HIRO balance."));
    }

    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(stakedBalance, "gwei"))) {
      return dispatch(error("You cannot unstake more than your sCST balance."));
    }

    await dispatch(changeStake({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const onClaimReward = async action => {
    await dispatch(claimReward({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const hasAllowance = useCallback(
    token => {
      return kageAllowance > 0;
    },
    [kageAllowance],
  )

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  )

  const changeView = (event, newView) => {
    setView(newView);
  }

  const trimmedBalance = Number(
    [stakedBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  return (
    <div id="stake-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Grid container direction="row" spacing={10}>
          <Grid item xs={12} sm={4} md={4} lg={4}>
            <Paper className={`ohm-card`}>
              <div>
                <Box className="help-text">
                  <Typography variant="body2" className="stake-note" color="textSecondary">
                    Number of Tokens to be staked
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <FormControl className="ohm-input" variant="outlined" color="primary">
                    <InputLabel htmlFor="amount-input"></InputLabel>
                    <OutlinedInput
                      id="amount-input"
                      type="number"
                      placeholder="Enter an amount"
                      className="stake-input"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      labelWidth={0}
                      endAdornment={
                        <InputAdornment position="end">
                          <Button variant="body2" onClick={setMax} color="inherit">
                            Max
                          </Button>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Box>
                <Box style={{margin: "10px 5px 5px 5px"}}>
                  {address && hasAllowance("ohm") ? (
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      disabled={isPendingTxn(pendingTransactions, "staking")}
                      onClick={() => {
                        onChangeStake("stake");
                      }}
                    >
                      {txnButtonText(pendingTransactions, "staking", "Stake HIRO")}
                    </Button>
                  ) : (
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                      onClick={() => {
                        onSeekApproval("ohm");
                      }}
                    >
                      {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                    </Button>
                  )}
                </Box>
              </div>
            </Paper>
            <Paper className={`ohm-card`}>
              <div>
                <Box className="help-text">
                  <Typography variant="body2" className="stake-note" color="textSecondary">
                    Current Tokens staked 175% APY
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <FormControl className="ohm-input textFieldProp" variant="outlined" color="primary" >
                    <FormLabel htmlFor="amount-input" className="textpro">{trimmedBalance}</FormLabel>
                  </FormControl>
                </Box>
                <Box className="help-text">
                  <Typography variant="body2" className="stake-note" color="textSecondary">
                    Pending Rewards
                  </Typography>
                </Box>
                <Grid direction="row" style={{ display: "flex" }}>
                  <Grid item xs={12} sm={6} md={6} lg={7}>
                    <Box display="flex" alignItems="center">
                      <FormControl className="ohm-input textFieldProp" variant="outlined" color="primary" >
                        <FormLabel htmlFor="amount-input" className="textpro">{trim(kageEarned, 2)}</FormLabel>
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={5}>
                    <Box display="flex" alignItems="center">
                      <FormControl className="ohm-input textFieldProp" variant="outlined" color="primary" style={{background: "#e55555"}}>
                        <FormLabel className="textpro" htmlFor="amount-input">7.5% Fee</FormLabel>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={4} alignItems="flex-end" style={{display: "flex", marginTop: "5px"}}>
                  <Grid item xs={12} sm={12} md={12} lg={6}>
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      disabled={isPendingTxn(pendingTransactions, "claiming") | true}
                      onClick={() => {
                        onClaimReward();
                      }}
                    >
                      {txnButtonText(pendingTransactions, "unstaking", "Claim")}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={6}>
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      style={{ minWidth: "90px" }}
                      disabled={isPendingTxn(pendingTransactions, "unstaking")}
                      onClick={() => {
                        onChangeStake("unstake");
                      }}
                    >
                      {txnButtonText(pendingTransactions, "unstaking", "Withdraw")}
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={8} md={8} lg={8}>
            <Paper className={`ohm-card`} style={{ height: "600px" }}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <div className="card-header">
                    <Typography style={{ fontSize: "1.1rem" }}>Staking Guide </Typography>
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Zoom>

      {/* <ExternalStakePool /> */}
    </div>
  );
}

export default Stake;
