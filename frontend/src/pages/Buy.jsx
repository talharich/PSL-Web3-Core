import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, AlertCircle } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { MOCK_NFTS, TIER_CONFIG } from '../data/mockData';

const STEPS = ['Select Moment', 'Payment', 'Minted!'];

// FIXED: Added safety checks for undefined values
const VALIDATION = {
  // Card number: 16 digits, allow spaces
  cardNumber: (value) => {
    if (!value) return false; // ADDED: Safety check
    const cleaned = value.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  },
  
  // Expiry: MM/YY format, valid month, not expired
  expiry: (value) => {
    if (!value) return false; // ADDED: Safety check
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    // Check if card is expired
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  },
  
  // CVC: 3-4 digits
  cvc: (value) => {
    if (!value) return false; // ADDED: Safety check
    return /^\d{3,4}$/.test(value);
  },
  
  // Name: At least 2 words, letters and spaces only
  name: (value) => {
    if (!value) return false; // ADDED: Safety check
    const trimmed = value.trim();
    return /^[A-Za-z\s]{3,}$/.test(trimmed) && trimmed.includes(' ');
  },
};

// ADDED: Error messages for user feedback
const ERROR_MESSAGES = {
  number: 'Please enter a valid 16-digit card number',
  expiry: 'Please enter a valid future date (MM/YY)',
  cvc: 'Please enter a valid 3-4 digit security code',
  name: 'Please enter your full name as shown on card',
};

export default function Buy() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(MOCK_NFTS[0]);
  const [loading, setLoading] = useState(false);

  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // ADDED: Validation errors state
  const [errors, setErrors] = useState({});
  // ADDED: Touched fields state (only validate after user interacts)
  const [touched, setTouched] = useState({});
  
  useEffect(()=>{}, [card]);

  const cfg = TIER_CONFIG[selected.tier];

  // ADDED: Format card number with spaces
  const formatCardNumber = (value) => {
    if (!value) return ''; // ADDED: Safety check
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  // ADDED: Format expiry as MM/YY
  const formatExpiry = (value) => {
    if (!value) return ''; // ADDED: Safety check
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  // ADDED: Handle input changes with formatting
  const handleInputChange = (field, value) => {
    let formattedValue = value || ''; // FIXED: Default to empty string
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = (value || '').replace(/\D/g, '').substr(0, 4);
    } else if (field === 'name') {
      formattedValue = (value || '').replace(/[^A-Za-z\s]/g, '');
    }
    
    setCard(p => ({ ...p, [field]: formattedValue }));
    
    // Validate on change if field has been touched
    if (touched[field]) {
      validateField(field, formattedValue);
    }
  };

  // ADDED: Handle field blur (mark as touched)
  const handleFieldBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    validateField(field, card[field] || '');
  };

  // ADDED: Validate single field
  const validateField = (field, value) => {
    const isValid = VALIDATION[field] ? VALIDATION[field](value || '') : true;
    setErrors(p => ({
      ...p,
      [field]: isValid ? null : ERROR_MESSAGES[field]
    }));
    return isValid;
  };

  // Check if form is valid for button state with better expiry handling
  const isFormValid = () => {
    const nameValid = VALIDATION.name(card.name || '');
    const numberValid = VALIDATION.cardNumber(card.number || '');
    const expiryValid = VALIDATION.expiry(card.expiry || '');
    const cvcValid = VALIDATION.cvc(card.cvc || '');
    
    // DEBUG: Log validation state to console (remove after testing)
    console.log('Validation state:', {
      name: { value: card.name, valid: nameValid },
      number: { value: card.number, valid: numberValid },
      expiry: { value: card.expiry, valid: expiryValid },
      cvc: { value: card.cvc, valid: cvcValid }
    });
    
    return nameValid && numberValid && expiryValid && cvcValid;
  };

  const handleBuy = () => {
    console.log('reached handleBuy');
    // Validate all fields before proceeding
    if (!isFormValid()) {
      return; // Stop if validation fails
    }
    
    console.log('handleBuy doesnt return, proceeding with checkout');

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2200);
  };

  // ADDED: Handle continue button from step 0
  const handleContinue = () => {
    setStep(1);
  };
  /* ───────────────────────── SUCCESS ───────────────────────── */
  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center animate-fade-in">
        <div
          className="
            w-28 h-28 mx-auto mb-6
            flex items-center justify-center text-5xl
            bg-green-500/10 border border-green-500/30
            shadow-[0_0_80px_rgba(34,197,94,0.25)]
            animate-pulse
          "
        >
          ✓
        </div>

        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
          MINTED
        </h1>

        <p className="text-gray-400 mb-1">
          <span className="text-green-400 font-semibold">
            {selected.playerName}
          </span>{' '}
          — {selected.moment}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Instant mint. No wallet. No gas.
        </p>

        <div className="card p-5 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token ID</span>
            <span className="text-white">#{selected.tokenId}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tier</span>
            <TierBadge tier={selected.tier} />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gas</span>
            <span className="text-green-400">$0.00</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="
            mt-6 w-full py-4
            bg-green-500 text-black font-semibold
            hover:scale-[1.02] transition
          "
        >
          View Collection
        </button>
      </div>
    );
  }

  /* ───────────────────────── MAIN ───────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">

      {/* HEADER */}
      <div className="mb-10">
        <p className="text-green-400 text-xs tracking-widest">
          GASLESS · INSTANT · WEB3 FREE
        </p>
        <h1 className="text-5xl font-bold text-white mt-2">
          Buy a Moment
        </h1>
      </div>

      {/* STEPS */}
      <div className="flex items-center mb-10 gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`
                w-7 h-7 flex items-center justify-center text-xs
                transition-all
                ${i <= step ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'}
              `}
              style={{ borderRadius: '50%' }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-xs text-gray-400">{s}</span>

            {i < STEPS.length - 1 && (
              <div className="w-8 h-px bg-white/10 mx-2" />
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* LEFT */}
        <div>

          {/* STEP 1 */}
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="text-xl text-white font-semibold">
                Select Moment
              </h2>

              {MOCK_NFTS.map(nft => {
                const c = TIER_CONFIG[nft.tier];
                const active = selected.tokenId === nft.tokenId;

                return (
                  <div
                    key={nft.tokenId}
                    onClick={() => setSelected(nft)}
                    className={`
                      p-4 cursor-pointer
                      transition-all duration-300
                      border
                      ${active ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                    `}
                    style={{
                      background: active ? `${c.color}10` : 'rgba(255,255,255,0.03)',
                      borderColor: active ? `${c.color}60` : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div className="flex justify-between items-center">

                      <div>
                        <p className="text-white font-medium">
                          {nft.playerName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {nft.moment}
                        </p>
                      </div>

                      <TierBadge tier={nft.tier} />
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleContinue}
                className="
                  mt-4 w-full py-3
                  bg-green-500 text-black font-semibold
                  hover:scale-[1.02] transition
                "
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl text-white font-semibold">
                Payment
              </h2>

              {/* UPDATED: Name field with validation */}
              <div>
                <input
                  placeholder="Cardholder Name"
                  value={card.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  className={`
                    w-full p-3
                    bg-white/5 border
                    text-white outline-none
                    focus:border-green-400
                    ${errors.name && touched.name ? 'border-red-500' : 'border-white/10'}
                  `}
                />
                {/* ADDED: Error message display */}
                {errors.name && touched.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* UPDATED: Card number field with validation */}
              <div>
                <input
                  placeholder="Card Number"
                  value={card.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  onBlur={() => handleFieldBlur('number')}
                  maxLength={19}
                  className={`
                    w-full p-3
                    bg-white/5 border
                    text-white outline-none
                    focus:border-green-400
                    ${errors.number && touched.number ? 'border-red-500' : 'border-white/10'}
                  `}
                />
                {/* ADDED: Error message display */}
                {errors.number && touched.number && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.number}
                  </p>
                )}
              </div>

              {/* UPDATED: Expiry and CVC row with validation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                    onBlur={() => handleFieldBlur('expiry')}
                    maxLength={5}
                    className={`
                      w-full p-3
                      bg-white/5 border
                      text-white outline-none
                      focus:border-green-400
                      ${errors.expiry && touched.expiry ? 'border-red-500' : 'border-white/10'}
                    `}
                  />
                  {/* ADDED: Error message display */}
                  {errors.expiry && touched.expiry && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.expiry}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value)}
                    onBlur={() => handleFieldBlur('cvc')}
                    maxLength={4}
                    className={`
                      w-full p-3
                      bg-white/5 border
                      text-white outline-none
                      focus:border-green-400
                      ${errors.cvc && touched.cvc ? 'border-red-500' : 'border-white/10'}
                    `}
                  />
                  {/* ADDED: Error message display */}
                  {errors.cvc && touched.cvc && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.cvc}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock size={12} className="text-green-400" />
                Secure checkout — no wallet needed
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 bg-white/10 text-white"
                >
                  Back
                </button>

                {/* UPDATED: Button disabled if form invalid */}
                <button
                  onClick={handleBuy}
                  disabled={loading || !isFormValid()}
                  className={`
                    flex-1 py-3
                    bg-green-500 text-black font-semibold
                    transition
                    ${loading || !isFormValid() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-[1.02]'}
                  `}
                >
                  {loading ? 'Minting...' : (
                    <>
                      <Zap className="inline" size={14} /> Mint
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="card p-6 sticky top-20">

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">
              {selected.playerName}
            </div>

            <TierBadge tier={selected.tier} size="lg" />

            <p className="text-gray-400 text-sm mt-2">
              {selected.moment}
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Price</span>
              <span className="text-white">
                ${selected.estimatedValue.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Gas</span>
              <span className="text-green-400">$0</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className="text-green-400 text-xl font-bold">
              ${selected.estimatedValue.toLocaleString()}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Zap, Lock } from 'lucide-react';
// import TierBadge from '../components/TierBadge';
// import { MOCK_NFTS, TIER_CONFIG } from '../data/mockData';

// const STEPS = ['Select Moment', 'Payment', 'Minted!'];

// export default function Buy() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(0);
//   const [selected, setSelected] = useState(MOCK_NFTS[0]);
//   const [loading, setLoading] = useState(false);

//   const [card, setCard] = useState({
//     number: '',
//     expiry: '',
//     cvc: '',
//     name: ''
//   });

//   const cfg = TIER_CONFIG[selected.tier];

//   const handleBuy = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       setStep(2);
//     }, 2200);
//   };

//   /* ───────────────────────── SUCCESS ───────────────────────── */
//   if (step === 2) {
//     return (
//       <div className="max-w-lg mx-auto px-6 py-24 text-center animate-fade-in">
//         <div
//           className="
//             w-28 h-28 mx-auto mb-6
//             flex items-center justify-center text-5xl
//             bg-green-500/10 border border-green-500/30
//             shadow-[0_0_80px_rgba(34,197,94,0.25)]
//             animate-pulse
//           "
//         >
//           ✓
//         </div>

//         <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
//           MINTED
//         </h1>

//         <p className="text-gray-400 mb-1">
//           <span className="text-green-400 font-semibold">
//             {selected.playerName}
//           </span>{' '}
//           — {selected.moment}
//         </p>

//         <p className="text-sm text-gray-500 mb-8">
//           Instant mint. No wallet. No gas.
//         </p>

//         <div className="card p-5 text-left space-y-3">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-400">Token ID</span>
//             <span className="text-white">#{selected.tokenId}</span>
//           </div>

//           <div className="flex justify-between text-sm">
//             <span className="text-gray-400">Tier</span>
//             <TierBadge tier={selected.tier} />
//           </div>

//           <div className="flex justify-between text-sm">
//             <span className="text-gray-400">Gas</span>
//             <span className="text-green-400">$0.00</span>
//           </div>
//         </div>

//         <button
//           onClick={() => navigate('/dashboard')}
//           className="
//             mt-6 w-full py-4
//             bg-green-500 text-black font-semibold
//             hover:scale-[1.02] transition
//           "
//         >
//           View Collection
//         </button>
//       </div>
//     );
//   }

//   /* ───────────────────────── MAIN ───────────────────────── */
//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">

//       {/* HEADER */}
//       <div className="mb-10">
//         <p className="text-green-400 text-xs tracking-widest">
//           GASLESS · INSTANT · WEB3 FREE
//         </p>
//         <h1 className="text-5xl font-bold text-white mt-2">
//           Buy a Moment
//         </h1>
//       </div>

//       {/* STEPS */}
//       <div className="flex items-center mb-10 gap-3">
//         {STEPS.map((s, i) => (
//           <div key={s} className="flex items-center gap-2">
//             <div
//               className={`
//                 w-7 h-7 flex items-center justify-center text-xs
//                 transition-all
//                 ${i <= step ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'}
//               `}
//               style={{ borderRadius: '50%' }}
//             >
//               {i < step ? '✓' : i + 1}
//             </div>
//             <span className="text-xs text-gray-400">{s}</span>

//             {i < STEPS.length - 1 && (
//               <div className="w-8 h-px bg-white/10 mx-2" />
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="grid md:grid-cols-2 gap-10">

//         {/* LEFT */}
//         <div>

//           {/* STEP 1 */}
//           {step === 0 && (
//             <div className="space-y-3">
//               <h2 className="text-xl text-white font-semibold">
//                 Select Moment
//               </h2>

//               {MOCK_NFTS.map(nft => {
//                 const c = TIER_CONFIG[nft.tier];
//                 const active = selected.tokenId === nft.tokenId;

//                 return (
//                   <div
//                     key={nft.tokenId}
//                     onClick={() => setSelected(nft)}
//                     className={`
//                       p-4 cursor-pointer
//                       transition-all duration-300
//                       border
//                       ${active ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
//                     `}
//                     style={{
//                       background: active ? `${c.color}10` : 'rgba(255,255,255,0.03)',
//                       borderColor: active ? `${c.color}60` : 'rgba(255,255,255,0.08)'
//                     }}
//                   >
//                     <div className="flex justify-between items-center">

//                       <div>
//                         <p className="text-white font-medium">
//                           {nft.playerName}
//                         </p>
//                         <p className="text-xs text-gray-400">
//                           {nft.moment}
//                         </p>
//                       </div>

//                       <TierBadge tier={nft.tier} />
//                     </div>
//                   </div>
//                 );
//               })}

//               <button
//                 onClick={() => setStep(1)}
//                 className="
//                   mt-4 w-full py-3
//                   bg-green-500 text-black font-semibold
//                   hover:scale-[1.02] transition
//                 "
//               >
//                 Continue
//               </button>
//             </div>
//           )}

//           {/* STEP 2 */}
//           {step === 1 && (
//             <div className="space-y-4">
//               <h2 className="text-xl text-white font-semibold">
//                 Payment
//               </h2>

//               {['name', 'number', 'expiry', 'cvc'].map((k) => (
//                 <input
//                   key={k}
//                   placeholder={k}
//                   value={card[k]}
//                   onChange={(e) =>
//                     setCard(p => ({ ...p, [k]: e.target.value }))
//                   }
//                   className="
//                     w-full p-3
//                     bg-white/5 border border-white/10
//                     text-white outline-none
//                     focus:border-green-400
//                   "
//                 />
//               ))}

//               <div className="flex items-center gap-2 text-xs text-gray-400">
//                 <Lock size={12} className="text-green-400" />
//                 Secure checkout — no wallet needed
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setStep(0)}
//                   className="flex-1 py-3 bg-white/10 text-white"
//                 >
//                   Back
//                 </button>

//                 <button
//                   onClick={handleBuy}
//                   disabled={loading}
//                   className="
//                     flex-1 py-3
//                     bg-green-500 text-black font-semibold
//                     hover:scale-[1.02]
//                   "
//                 >
//                   {loading ? 'Minting...' : (
//                     <>
//                       <Zap className="inline" size={14} /> Mint
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* RIGHT */}
//         <div className="card p-6 sticky top-20">

//           <div className="text-center mb-6">
//             <div className="text-4xl mb-3">
//               {selected.playerName}
//             </div>

//             <TierBadge tier={selected.tier} size="lg" />

//             <p className="text-gray-400 text-sm mt-2">
//               {selected.moment}
//             </p>
//           </div>

//           <div className="space-y-2 text-sm text-gray-400">
//             <div className="flex justify-between">
//               <span>Price</span>
//               <span className="text-white">
//                 ${selected.estimatedValue.toLocaleString()}
//               </span>
//             </div>

//             <div className="flex justify-between">
//               <span>Gas</span>
//               <span className="text-green-400">$0</span>
//             </div>
//           </div>

//           <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
//             <span className="text-gray-400">Total</span>
//             <span className="text-green-400 text-xl font-bold">
//               ${selected.estimatedValue.toLocaleString()}
//             </span>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }