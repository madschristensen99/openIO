'use client';

import Navbar from './Navbar';
import CardEffect from './CardEffect';
import DappMainContent from './DappMainContent';

export default function MainLand() {
  return (
    <>
      <Navbar />
      <CardEffect />
      <DappMainContent showHeader={false} />
    </>
  );
}

