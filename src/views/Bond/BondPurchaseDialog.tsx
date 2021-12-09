import { Box, Modal, Paper, SvgIcon, IconButton, makeStyles, Grid } from '@material-ui/core';
import { ReactComponent as XIcon } from '../../assets/icons/icon_close.svg';
import BondLogo from '../../components/BondLogo';
import { Bond } from 'src/constants';

import { prettifySeconds } from '../../helpers';

import './bondDialog.scss';

const useStyles = makeStyles(theme => ({
  modalContent: {
    backgroundColor: theme.palette.mode.lightGray100,
  },
  detailContent: {
    backgroundColor: theme.palette.mode.white,
  },
  inputGroup: {
    '& .MuiOutlinedInput-root': {
      borderColor: theme.palette.mode.lightGray300,
      backgroundColor: theme.palette.background.default,
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

interface BondDialogProps {
  open: boolean;
  handleClose: () => void;
  bond: Bond;
  balance: string;
  reserveUnit: string;
  bondQuote: string;
  bondDiscount: string;
  autoStake: string;
  vestingTerm: number;
}

function BondPurchaseDialog({
  open,
  handleClose,
  bond,
  balance,
  reserveUnit,
  bondQuote,
  bondDiscount,
  autoStake,
  vestingTerm,
}: BondDialogProps) {
  const styles = useStyles();
  return (
    <Modal id="bdialog" open={open} onClose={handleClose} hideBackdrop>
      <Paper className={`${styles.modalContent} clam-popover`}>
        <div className="dialog-wrap">
          <div className="header">
            <div className="close-wrapper">
              <IconButton onClick={handleClose}>
                <SvgIcon color="primary" component={XIcon} />
              </IconButton>
            </div>
            <div className="title">
              <p>Otter'standing!</p>
            </div>
          </div>

          <div className="body">
            <div className="confirm">
              <span>Your bond was successful.</span>
            </div>
            <div className="logo-wrapper">
              <BondLogo bond={bond} />
            </div>
            <div className="amt-msg">
              You will get <span className="quantity">{bondQuote}</span> sCLAM!
            </div>
            <div className="dtl-container">
              <div className={`${styles.detailContent} dtl-wrap`}>
                <Grid container className="dtl">
                  <Grid item xs={6} md={6}>
                    <div>Your Balance</div>
                  </Grid>
                  <Grid item xs={6} md={6} className="dtl-value">
                    <div>
                      {balance} {reserveUnit}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <div>ROI</div>
                  </Grid>
                  <Grid item xs={6} md={6} className="dtl-value">
                    <div>
                      {bondDiscount}% + staking {autoStake}%
                    </div>
                  </Grid>
                  <Grid item xs={6} md={6}>
                    <div>Vesting Term</div>
                  </Grid>
                  <Grid item xs={6} md={6} className="dtl-value">
                    <div>{prettifySeconds(vestingTerm, 'day')}</div>
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </Modal>
  );
}

export default BondPurchaseDialog;
