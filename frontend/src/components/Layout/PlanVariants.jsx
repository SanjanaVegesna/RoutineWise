// // // PlanVariants.jsx
// // import React from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { doc, setDoc, collection } from 'firebase/firestore';
// // import { db, auth } from '../../firebase';
// // import { motion } from 'framer-motion';

// // const PlanVariants = ({ variants, dateKey }) => {
// //     const navigate = useNavigate();

// //     const handleSelectVariant = async (variant) => {
// //         const user = auth.currentUser;
// //         if (!user) return;

// //         const userId = user.uid;
// //         const dateKey = new Date().toISOString().split("T")[0];

// //         // 1. Save selected variant as today's main plan
// //         await setDoc(doc(db, "plans", userId, dateKey, "plan"), {
// //             createdAt: new Date().toISOString(),
// //             plan: variant.plan,
// //             selectedVariant: variant.name,
// //         });

// //         // 2. Save metadata about variant under nested collection
// //         const variantDocRef = doc(
// //             db,
// //             "plans",
// //             userId,
// //             dateKey,
// //             "variants",
// //             variant.name
// //         );

// //         await setDoc(variantDocRef, {
// //             createdAt: new Date().toISOString(),
// //             plan: variant.plan,
// //             strategy: variant.strategy,
// //             selected: true,
// //         });

// //         navigate("/dashboard");
// //     };


// //     return (
// //         <div className="p-6 space-y-6">
// //             <h2 className="text-2xl font-bold text-center mb-4">🧭 Choose a Plan Variant</h2>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {variants.map((variant, idx) => (
// //                     <motion.div
// //                         key={idx}
// //                         whileHover={{ scale: 1.02 }}
// //                         className="p-4 bg-white shadow-lg rounded-xl border border-gray-200"
// //                     >
// //                         <h3 className="text-lg font-semibold text-blue-600 mb-2">{variant.strategy}</h3>
// //                         <ul className="text-sm space-y-1 mb-4">
// //                             {variant.plan.slice(0, 5).map((t, i) => (
// //                                 <li key={i} className="text-gray-700">🔹 {t.task} @ {t.time}</li>
// //                             ))}
// //                             {variant.plan.length > 5 && <li className="text-gray-400">...and more</li>}
// //                         </ul>
// //                         <button
// //                             onClick={() => handleSelectVariant(variant)}
// //                             className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
// //                         >
// //                             Select This Plan
// //                         </button>
// //                     </motion.div>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // export default PlanVariants;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { setPlanFromVariant } from "../../services/firestoreService";
// import { motion } from "framer-motion";
// import { auth } from "../../firebase";

// const PlanVariants = ({ variants, onVariantSelected }) => {
//   const navigate = useNavigate();

//   const handleSelectVariant = async (variant) => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const userId = user.uid;
//     const dateKey = new Date().toISOString().split("T")[0];

//     await setPlanFromVariant(userId, dateKey, variant);

//     if (onVariantSelected) {
//       onVariantSelected(); // notify parent to reload the plan
//     }

//     navigate("/dashboard");
//   };

//   return (
//     <div className="p-6 rounded-lg bg-white shadow border space-y-4 mt-4">
//       <h3 className="text-lg font-semibold">🧠 Choose a Plan Variant</h3>

//       {variants.map((variant) => (
//         <motion.div
//           key={variant.name}
//           whileHover={{ scale: 1.02 }}
//           className="p-4 border rounded-xl bg-slate-50"
//         >
//           <div className="flex justify-between items-center mb-2">
//             <p className="font-bold">{variant.strategy}</p>
//             <button
//               onClick={() => handleSelectVariant(variant)}
//               className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
//             >
//               Use This Plan
//             </button>
//           </div>
//           <ul className="pl-4 list-disc text-sm text-gray-700 space-y-1">
//             {variant.plan.map((task, index) => (
//               <li key={index}>
//                 {task.time} — {task.task} ({task.duration} mins)
//               </li>
//             ))}
//           </ul>
//         </motion.div>
//       ))}
//     </div>
//   );
// };

// export default PlanVariants;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setPlanFromVariant } from "../../services/firestoreService";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";

const PlanVariants = ({ variants, onVariantSelected }) => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null); // store which variant is open

  const handleSelectVariant = async (variant) => {
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const dateKey = new Date().toISOString().split("T")[0];

    await setPlanFromVariant(userId, dateKey, variant);

    if (onVariantSelected) {
      onVariantSelected();
    }

    navigate("/dashboard");
  };

  const toggleExpand = (idx) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="p-6 rounded-lg bg-white shadow border space-y-6 mt-4">
      <h3 className="text-xl font-bold text-center">🧠 Choose a Plan Variant</h3>

      {variants.map((variant, idx) => (
        <motion.div
          key={variant.name}
          whileHover={{ scale: 1.01 }}
          className="p-4 border rounded-xl bg-slate-50 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold text-blue-700">{variant.strategy}</p>
              <p className="text-xs text-gray-500">{variant.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleExpand(idx)}
                className="text-sm text-indigo-600 underline"
              >
                {expandedIndex === idx ? "Hide Tasks" : "View Tasks"}
              </button>
              <button
                onClick={() => handleSelectVariant(variant)}
                className="px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                Use This Plan
              </button>
            </div>
          </div>

          <AnimatePresence>
            {expandedIndex === idx && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pl-5 list-disc text-sm text-gray-700 overflow-hidden space-y-1 mt-3"
              >
                {variant.plan.map((task, index) => (
                  <li key={index}>
                    {task.time} — {task.task} ({task.duration} mins)
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default PlanVariants;
