import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    updateDoc
} from "firebase/firestore";

// 1. Get the active plan for the current day
export async function getUserPlan(userId, dateKey) {
    const docRef = doc(db, "plans", userId, dateKey, "plan");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

// 2. Get fallback plan variants (inside /plan/variants/)
export async function getPlanVariants(userId, dateKey) {
    const colRef = collection(db, "plans", userId, dateKey, "plan", "variants");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
}


// 3. Set the selected variant as today's active plan
export async function setPlanFromVariant(userId, dateKey, variant) {
    const planRef = doc(db, "plans", userId, dateKey, "plan");

    // 1. Overwrite today's main plan
    await setDoc(planRef, {
        createdAt: new Date().toISOString(),
        plan: variant.plan,
        selectedVariant: variant.name
    });

    // 2. Mark this variant as selected
    const variantRef = doc(db, "plans", userId, dateKey, "plan", "variants", variant.name);
    await setDoc(variantRef, {
        ...variant,
        selected: true,
        createdAt: new Date().toISOString()
    });

    // 3. Mark all other variants as unselected
    const allVariants = await getDocs(collection(db, "plans", userId, dateKey, "plan", "variants"));
    for (const v of allVariants.docs) {
        if (v.id !== variant.name) {
            await updateDoc(doc(db, "plans", userId, dateKey, "plan", "variants", v.id), { selected: false });
        }
    }
}
