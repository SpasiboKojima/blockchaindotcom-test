'use client';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { QRCodeSVG } from 'qrcode.react';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { WretchError } from 'wretch/resolver';
import { generateAddress } from '~/utils/bitcoin';
import { type Address, type Blockchain, blockchainApi } from './api';
import { Toaster, useToaster } from './components/Toaster';

const changeAmount = (newValue: string, previousValue: string) => {
  const value = Number(newValue);
  if (Number.isNaN(value) || value < 0) return previousValue;
  return newValue;
};

let interval: NodeJS.Timeout;

export const PaymentForm = () => {
  const [parent] = useAutoAnimate();

  const toast = useToaster((state) => state.toast);

  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isPaymentReceived, setIsPaymentReceived] = useState(false);

  const address = useMemo(generateAddress, []);

  const handleAmountInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(changeAmount(e.target.value, amount));
  };

  const handleGeneratePayment = async () => {
    if (interval) clearInterval(interval);

    setQrCode(`bitcoin:${address}?amount=${amount}`);
    setAmount('');

    let currentHeight = 0;
    try {
      const blockchainInfo = (await blockchainApi.get()) as Blockchain;

      currentHeight = blockchainInfo.height;
    } catch (err) {
      if (err instanceof WretchError) {
        toast(err.json.error || err.text);
        return;
      }
    }

    interval = setInterval(async () => {
      try {
        const addressObject = (await blockchainApi.url(`/addrs/${address}?after=${currentHeight}`).get()) as Address;

        if (addressObject.txrefs?.length) {
          setIsPaymentReceived(true);
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
        if (err instanceof WretchError) {
          toast(err.json.error || err.text);
          return;
        }
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div ref={parent} className='flex flex-col gap-4 items-center h-80'>
        <input
          type='text'
          placeholder='Payment amount'
          className='input input-bordered w-full max-w-xs text-center'
          value={amount}
          onChange={handleAmountInput}
        />

        {amount && Number(amount) > 0 && (
          <button className='btn btn-neutral w-full' onClick={handleGeneratePayment}>
            Generate Bitcoin Address
          </button>
        )}

        {qrCode && (
          <>
            <div className='flex flex-col gap-4 items-center'>
              Generated QR code for payment:
              <a href={qrCode} target='_blank' rel='noreferrer'>
                <QRCodeSVG value={qrCode} />
              </a>
            </div>
            {isPaymentReceived ? (
              <span className='text-success'>You payment was received!</span>
            ) : (
              <div className='flex items-center gap-4'>
                <span className='loading loading-spinner' />
                Waiting for your payment
              </div>
            )}
          </>
        )}
      </div>
      <Toaster />
    </>
  );
};
