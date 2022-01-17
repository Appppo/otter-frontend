import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/store/hook';
import { useTranslation } from 'react-i18next';
import { useWeb3Context } from '../../hooks';

import {
  Box,
  Grid,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Slide,
  FormControl,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import BondPurchaseDialog from './BondPurchaseDialog';
import ActionButton from '../../components/Button/ActionButton';
import BondNFTDiscount from './BondNFTDiscount';

import { ethers } from 'ethers';

import { changeApproval, bondAsset, calcBondDetails } from '../../store/actions/bond-action';
import { IPendingTxn } from '../../store/slices/pending-txns-slice';
import { IReduxState } from '../../store/slices/state.interface';

import { Bonding, BondKey, AccountBond, getBond, getPAWAddress } from 'src/constants';
import { shorten, trim, prettifySeconds } from '../../helpers';
import { tabletMediaQuery } from 'src/themes/mediaQuery';
import { NFTDiscountOption } from './types';

const useStyles = makeStyles(theme => ({
  input: {
    '& .MuiOutlinedInput-root': {
      borderColor: 'transparent',
      backgroundColor: theme.palette.background.paper,
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.mode.lightGray300,
    },
  },
}));

interface IBondPurchaseProps {
  bondKey: BondKey;
  slippage: number;
  canSelect: boolean;
  selection?: NFTDiscountOption;
  selectedAccountBond: AccountBond;
  selectedBonding: Bonding;
  setSelection: Dispatch<SetStateAction<NFTDiscountOption | undefined>>;
  setNftDialogOpen: Dispatch<SetStateAction<boolean>>;
}

function BondPurchase({
  bondKey,
  slippage,
  canSelect,
  selectedBonding,
  selectedAccountBond,
  selection,
  setSelection,
  setNftDialogOpen,
}: IBondPurchaseProps) {
  const isTablet = useMediaQuery(tabletMediaQuery);
  const styles = useStyles();
  const dispatch = useAppDispatch();
  const { provider, address, chainID } = useWeb3Context();
  const bond = getBond(bondKey, chainID);
  const [recipientAddress, setRecipientAddress] = useState(address);
  const [quantity, setQuantity] = useState('');

  const [open, setOpen] = useState(false);

  const handleSelect = () => {
    if (!canSelect) {
      return;
    }
    return setNftDialogOpen(true);
  };

  const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
  const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
    return state.pendingTransactions;
  });

  const { interestDue, pendingPayout, balance, rawBalance, allowance } = selectedAccountBond;
  const { debtRatio, bondQuote, vestingTerm, maxPayout, maxUserCanBuy, bondDiscount } = selectedBonding;
  const { t } = useTranslation();
  const vestingPeriod = () => {
    return prettifySeconds(t, vestingTerm, 'day');
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const onBond = useCallback(async () => {
    if (quantity === '') {
      return alert(t('bonds.purchase.noValue'));
      //@ts-ignore
    }
    if (isNaN(+quantity)) {
      return alert(t('bonds.purchase.invalidValue'));
    }
    if (interestDue > 0 || pendingPayout > 0) {
      const shouldProceed = window.confirm(
        bond.autostake ? t('bonds.purchase.resetVestingAutostake') : t('bonds.purchase.resetVesting'),
      );
      if (shouldProceed) {
        const bondAssetPayload = (() => {
          const basePayload = {
            value: quantity,
            slippage,
            bondKey,
            networkID: chainID,
            provider,
          };
          if (selection) {
            const nftAddress = getPAWAddress(selection?.key, chainID);
            const tokenId = selection.id;
            return { ...basePayload, address, nftAddress, tokenId };
          }
          return { ...basePayload, address: recipientAddress || address };
        })();
        const bondTx = await dispatch(bondAsset(bondAssetPayload));
        if (bondTx.payload) {
          handleOpenDialog();
        }
      }
    }
  }, [quantity, interestDue, pendingPayout, chainID, recipientAddress, address]);

  const hasAllowance = useCallback(() => {
    return allowance > 0;
  }, [allowance]);
  const setMax = () => {
    setQuantity(ethers.utils.formatEther(maxUserCanBuy));
  };
  const fiveDayRate = useSelector<IReduxState, number>(state => state.app.fiveDayRate);

  async function loadBondDetails() {
    if (provider)
      await dispatch(
        calcBondDetails({ bondKey, value: quantity, provider, networkID: chainID, userBalance: rawBalance }),
      );
  }

  useEffect(() => {
    loadBondDetails();
    if (address) setRecipientAddress(address);
  }, [provider, quantity, address, rawBalance]);

  const onSeekApproval = async () => {
    await dispatch(changeApproval({ bondKey, provider, networkID: chainID, address }));
  };

  const bondUnit = bond.autostake ? 'sCLAM' : 'CLAM';

  return (
    <Box display="flex" flexDirection="column">
      <Grid container spacing={isTablet ? 1 : 2} className={`${styles.input} input-container`}>
        <Grid item xs={12} md={9}>
          <FormControl variant="outlined" color="primary" fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount"></InputLabel>
            <OutlinedInput
              placeholder={`${bond.reserveUnit} ${t('common.amount')}`}
              id="outlined-adornment-amount"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              labelWidth={0}
              className="bond-input"
              endAdornment={
                <InputAdornment position="end">
                  <div className="stake-input-btn" onClick={setMax}>
                    <p>{t('common.max')}</p>
                  </div>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          {hasAllowance() ? (
            <ActionButton
              pendingTransactions={pendingTransactions}
              type={'bond_' + bond.key}
              start="Bond"
              progress="Bonding..."
              processTx={() => onBond()}
            ></ActionButton>
          ) : (
            <ActionButton
              pendingTransactions={pendingTransactions}
              type={'approve_' + bond.key}
              start="Approve"
              progress="Approving..."
              processTx={() => onSeekApproval()}
            ></ActionButton>
          )}
        </Grid>
        <BondPurchaseDialog
          open={open}
          handleClose={handleCloseDialog}
          bond={bond}
          balance={trim(balance, 4)}
          reserveUnit={bond.reserveUnit}
          bondQuote={trim(bondQuote, 4) || '0'}
          bondDiscount={trim(bondDiscount * 100, 2)}
          autoStake={trim(fiveDayRate * 100, 2)}
          vestingTerm={vestingTerm}
        />
      </Grid>

      <p className="purchase-note">{hasAllowance() && bond.autostake && t('bonds.purchase.fourFourInfo')}</p>
      {bond.key === 'mai_clam44' && (
        <BondNFTDiscount
          disabled={!canSelect}
          selection={selection}
          setSelection={setSelection}
          onClick={handleSelect}
        />
      )}

      <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <p className="bond-balance-title">{t('common.yourBalance')}</p>
            <p className="bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : <>{`${trim(balance, 4)} ${bond.reserveUnit}`}</>}
            </p>
          </div>

          <div className={`data-row`}>
            <p className="bond-balance-title">{t('bonds.purchase.youWillGet')}</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(bondQuote, 4) || '0'} ${bondUnit}`}
            </p>
          </div>

          <div className={`data-row`}>
            <p className="bond-balance-title">{t('bonds.purchase.maxBuy')}</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(maxPayout, 4) || '0'} ${bondUnit}`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">{t('common.roi')}</p>
            <p className="bond-balance-value">
              {isBondLoading ? (
                <Skeleton width="100px" />
              ) : (
                <>
                  {trim(bondDiscount * 100, 2)}%{bond.autostake && `+ staking ${trim(fiveDayRate * 100, 2)}%`}
                </>
              )}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.debtRatio')}</p>
            <p className="bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(debtRatio / 10000000, 2)}%`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.vestingTerm')}</p>
            <p className="bond-balance-value">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
          </div>

          {recipientAddress !== address && (
            <div className="data-row">
              <p className="bond-balance-title">{t('bonds.recipient')}</p>
              <p className="bond-balance-value">
                {isBondLoading ? <Skeleton width="100px" /> : shorten(recipientAddress)}
              </p>
            </div>
          )}
        </Box>
      </Slide>
    </Box>
  );
}

export default BondPurchase;
