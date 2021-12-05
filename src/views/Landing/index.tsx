import './landing.scss';
import { useState } from 'react';
import Header from '../../components/LandingHeader';
import Stat from './components/Stat';
import { Backdrop, Button, Link, Paper, Popper, Typography, Fade, Box, makeStyles, SvgIcon } from '@material-ui/core';
import SecondSection from './components/SecondSection';
import Footer from './components/Footer';
import { DiscordLink, GithubLink, TwitterLink } from 'src/constants';
import TwitterIcon from './images/twitter.svg';
import DiscordIcon from './images/icon_discord.svg';
import GithubIcon from './images/icon_github.svg';
import Otter01 from './images/otter_01.png';
import CloseIcon from './images/icon_24x24_close.svg';
import Countdown from './components/Countdown';
import WhiteList from '../WhiteList';
import { useTranslation, Trans } from 'react-i18next';

function Landing() {
  const { t, i18n } = useTranslation();
  //Arrange language dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const langDropdownOpen = Boolean(anchorEl);
  const lngs = {
    en: { nativeName: 'English' },
    de: { nativeName: 'Deutsch' },
  };

  return (
    <div className="landing">
      <Header />
      <section className="landing__first-section">
        <div className="landing__first-section__title">
          <h1>
            Otter<span style={{ color: '#FF6854' }}>C</span>lam
          </h1>
        </div>
        <div className="landing__first-section__subtitle">
          <p>Wen (3,3) becomes (🦦,🦦)</p>
        </div>
        <div className="landing__first-section__body">
          <div className="landing__first-section__body__left">
            <div className="landing__first-section__body__title">
              <p>
                <Trans i18nKey="landing.description.part1" />
              </p>
              <p>
                {' '}
                <Trans i18nKey="landing.description.part2" />
              </p>
            </div>
            <div className="landing__first-section__body__subtitle">
              <p>
                <Trans i18nKey="landing.description.tagline" />
              </p>
            </div>
            <a className="landing__first-section__body__app-button" href="https://app.otterclam.finance">
              <Button variant="contained" color="primary" size="medium" disableElevation>
                <Trans i18nKey="landing.appButton" />
              </Button>
            </a>
            <div className="community-icons">
              <Link href={TwitterLink} className="community-icon-link">
                <img src={TwitterIcon} />
              </Link>
              <Link href={DiscordLink} className="community-icon-link">
                <img src={DiscordIcon} />
              </Link>
              <Link href={GithubLink} className="community-icon-link">
                <img src={GithubIcon} />
              </Link>
              <div>
                {Object.keys(lngs).map(lng => (
                  <button
                    key={lng}
                    style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }}
                    type="submit"
                    onClick={() => i18n.changeLanguage(lng)}
                  >
                    {(lng: string) => (lngs: Record<string, any>) => lngs[lng].nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="otter01">
            <img src={Otter01} alt="otter01" />
          </div>
        </div>
        <div className="landing__first-section__footer">
          <div className="landing__first-section__footer__wave" />
        </div>
      </section>
      <Stat />
      <SecondSection />
      <Footer />
      <Backdrop open={open} className="whitelist-check">
        <div className="whitelist-container">
          <WhiteList />
          <div className="close-modal-button" onClick={() => setOpen(false)}>
            <img src={CloseIcon} />
          </div>
        </div>
      </Backdrop>
    </div>
  );
}

export default Landing;
