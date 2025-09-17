// src/services/invitesService.ts
import { db } from "../firebase";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { INVITES_COLL, ORG_COLL } from "../colls";


export type InviteDoc = {
  token: string;
  invitedBy: string;
  status: "pending" | "accepted" | "expired";
  createdAt: any;
  acceptedAt?: any;
};

/**
 * Cria um novo convite no Firestore
 */
export async function createInvite(invitedBy: string): Promise<{ token: string; link: string }> {
    const token = Math.random().toString(36).substring(2, 10);


  await addDoc(collection(db, INVITES_COLL), {
    token,
    invitedBy,
    status: "pending",
    createdAt: serverTimestamp(),
  } satisfies InviteDoc);

  const URL_WEB = import.meta.env.EXPO_PUBLIC_WEB_URL;
  const inviteLink = `${URL_WEB}/invite?token=${token}`;
    
  return { token, link: inviteLink };
}

/**
 * Valida um convite existente
 */
export async function validateInvite(token: string): Promise<InviteDoc | null> {
  const q = query(collection(db, INVITES_COLL), where("token", "==", token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as InviteDoc;
}

/**
 * Marca convite como aceito
 */
export async function acceptInvite(token: string, userId: string) {
  // busca invite pelo token
  const q = query(collection(db, INVITES_COLL), where("token", "==", token));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Invite inválido ou expirado");
  }

  const inviteDoc = snap.docs[0];
  const inviteData = inviteDoc.data() as any;

  if (inviteData.status === "accepted") {
    throw new Error("Invite já aceito");
  }

  const invitedBy = inviteData.invitedBy;

  // pega org do invitedBy
  const orgQ = query(
    collection(db, ORG_COLL),
    where("members", "array-contains", invitedBy)
  );
  const orgSnap = await getDocs(orgQ);

  if (orgSnap.empty) {
    throw new Error("Organização não encontrada");
  }

  const orgRef = orgSnap.docs[0].ref;

  // adiciona novo user
  await updateDoc(orgRef, {
    members: arrayUnion(userId),
  });

  // marca convite como aceito
  await updateDoc(inviteDoc.ref, {
    status: "accepted",
    acceptedBy: userId,
    acceptedAt: new Date(),
  });

  return true;
}

export async function acceptInviteAndJoinOrg(
    token: string,
    newUserId: string
  ): Promise<string | null> {
    // 1. valida se convite existe
    const q = query(collection(db, INVITES_COLL), where("token", "==", token));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.warn("Convite inválido");
      return null;
    }
  
    const inviteDoc = snap.docs[0];
    const inviteData = inviteDoc.data() as any;
  
    if (inviteData.status === "accepted") {
      console.warn("Convite já aceito");
      return null;
    }
  
    const invitedBy = inviteData.invitedBy;
  
    // 2. marca convite como aceito
    await updateDoc(inviteDoc.ref, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
    });
  
    // 3. encontra a organização do invitedBy
    const orgQuery = query(
      collection(db, ORG_COLL),
      where("members", "array-contains", invitedBy)
    );
    const orgSnap = await getDocs(orgQuery);
  
    if (orgSnap.empty) {
      console.warn("Organização não encontrada para invitedBy");
      return null;
    }
  
    const orgDoc = orgSnap.docs[0];
  
    // 4. adiciona novo membro
    const members = orgDoc.data().members || [];
    if (!members.includes(newUserId)) {
      await updateDoc(orgDoc.ref, {
        members: [...members, newUserId],
        updatedAt: serverTimestamp(),
      });
    }
  
    return orgDoc.id;
  }
