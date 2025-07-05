import { NextRequest, NextResponse } from "next/server";
import { verifyCloudProof } from "@worldcoin/idkit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof, merkle_root, nullifier_hash, verification_level } = body;

    console.log("🔍 API - Données reçues:", { proof, merkle_root, nullifier_hash, verification_level });

    // Validation des données requises
    if (!proof || !merkle_root || !nullifier_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "Données manquantes: proof, merkle_root et nullifier_hash requis",
        },
        { status: 400 }
      );
    }

    // Récupérer la configuration depuis les variables d'environnement
    const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`;
    const action = "verify"; // Action standard selon la documentation
    
    if (!appId) {
      return NextResponse.json(
        {
          success: false,
          message: "Configuration World ID manquante",
        },
        { status: 500 }
      );
    }

    console.log("🔑 Vérification avec App ID:", appId, "Action:", action);

    // Vérifier la preuve avec l'API World ID
    // Selon la documentation: verifyCloudProof(proof, app_id, action, signal?)
    const verifyRes = await verifyCloudProof(
      {
        proof,
        merkle_root,
        nullifier_hash,
        verification_level
      },
      appId,
      action
      // Pas de signal pour cette action générique
    );

    console.log("📋 Résultat de verifyCloudProof:", verifyRes);

    if (verifyRes.success) {
      console.log("✅ Vérification World ID réussie !");
      
      // Sauvegarder le nullifier_hash pour éviter les réutilisations
      // TODO: Implémenter la sauvegarde en base de données
      
      return NextResponse.json({
        success: true,
        message: "Vérification World ID réussie",
        nullifier: nullifier_hash,
        verified: true,
      });
    } else {
      console.log("❌ Échec de la vérification:", verifyRes.detail);
      return NextResponse.json(
        {
          success: false,
          message: "Échec de la vérification World ID",
          error: verifyRes.detail || "Vérification échouée",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification World ID:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la vérification",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
} 