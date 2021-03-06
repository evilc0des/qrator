import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import QrScanner from 'qr-scanner';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';

type QrCodeResult = {
  data: string,
}
type BookingData = {
  id?: string,
  time?: string
}

const Home: NextPage = () => {
  const videoElem = useRef<HTMLVideoElement | null>(null);
  const qrScanner = useRef<QrScanner | null>(null);

  const [ resultModalVisible, setResultModalVisible ] = useState(false);
  const [ bookingData, setBookingData ] = useState<BookingData>({});

  const [ seats, setSeats ] = useState([]);
  const [ isAdmitted, setAdmitted ] = useState(false);
  const [ notFound, setNotFound ] = useState(false);

  const [ isFetching, setIsFetching ] = useState(false);

  const handleQrCodeData = ({ data }: QrCodeResult) => {
    const dataArr = data.split(",");
    console.log(dataArr);
    if(dataArr.length === 4) {
      const bookingId = (dataArr[0].split("-"))[0];
      const bookingTime = `${dataArr[2]}, ${dataArr[3]}`
      setBookingData({
        id: bookingId,
        time: bookingTime
      });
      if(!resultModalVisible) setResultModalVisible(true);
    }
  }

  useEffect(() => {
    if(bookingData.id) {
      setIsFetching(true);
      fetch(`/api/ticket/${bookingData.id}`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        if(!data.bookingId) {
          setNotFound(true);
          setIsFetching(false);
          return;
        }
        if(seats.length < 1) {
          setSeats(data.seats);
          setAdmitted(data.admitted);
          setIsFetching(false);
        }
      });
    }
  }, [bookingData.id])
  
  const setVideoRef = (elem: HTMLVideoElement) => {
    videoElem.current = elem;
    if(!qrScanner.current) {
      qrScanner.current = new QrScanner(elem, handleQrCodeData, {});
    }
    // QrScanner.listCameras(true).then((val) => {
    //   console.log(val);
    // }); 
    qrScanner.current.start();
  }

  const handleAdmit = () => {
    fetch(`/api/ticket/${bookingData.id}`, {
      method: 'POST',
      body: JSON.stringify({admit: true})
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if(data.acknowledged) {
        clearQRData();
      }
    });
  }

  const clearQRData = () => {
    setResultModalVisible(false);
    setBookingData({});
    setSeats([]);
    setAdmitted(false);
    setNotFound(false);
    setIsFetching(false);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>QRator</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <video ref={setVideoRef} className={styles.video}></video>
        <Dialog open={resultModalVisible} onClose={() => clearQRData()} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30"/>
            <div className="relative bg-white rounded mx-auto px-6 pt-6 min-w-[65vw]">
              <Dialog.Title className="text-2xl font-semibold text-center">Booking Id</Dialog.Title>
              <Dialog.Description className="text-lg font-semibold text-center">
                {bookingData.id}
              </Dialog.Description>

              <p className="text-center mb-8">
                {bookingData.time}
              </p>

              {isFetching 
               ? <div className="w-full flex justify-center"><div className={styles["lds-ellipsis"]}><div></div><div></div><div></div><div></div></div></div>
               : <>
                  <h2 className="text-center">Seats</h2>
                  <p className="text-center mb-8 font-semibold">
                    {seats.join(", ")}
                  </p>
                  
                  
                  {
                    !isAdmitted
                    ? notFound
                      ? <div className="border-t w-full">
                        <h1 className="text-2xl font-bold text-red-500 text-center">NOT FOUND</h1>
                      </div>
                      :<div className="border-t w-full grid grid-cols-2">
                        <button className="border-r p-4 border-box self-center" onClick={() => handleAdmit()}>Admit</button>
                        <button onClick={() => clearQRData()}>Cancel</button>
                      </div>
                    : <div className="border-t w-full">
                      <h1 className="text-2xl font-bold text-red-500 text-center">ALREADY ADMITTED</h1>
                    </div>
                  }
               </>
              }
              
              
            </div>
          </div>
        </Dialog>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            Appato
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
