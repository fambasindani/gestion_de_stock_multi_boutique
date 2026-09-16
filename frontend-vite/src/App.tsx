import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";

import RootLoginPage from "@/app/page";
import AuthLoginPage from "@/app/auth/login/page";

import DashboardPage from "@/app/dashboard/page";

import InventaireListPage from "@/app/dashboard/inventaire/page";
import InventaireDetailPage from "@/app/dashboard/inventaire/_id/page";
import SocietesPage from "@/app/dashboard/societes/page";
import PosPage from "@/app/dashboard/pos/page";
import ProfilPage from "@/app/dashboard/profil/page";
import ParametresPage from "@/app/dashboard/parametres/page";
import RapportVendeursPage from "@/app/rapports/ventes-vendeurs/page";
import RapportVendeurDetailsPage from "@/app/rapports/ventes-vendeurs/_id/page";

import FacturesPage from "@/app/dashboard/factures/page";
import FactureNouveauPage from "@/app/dashboard/factures/nouveau/page";
import FactureDetailsPage from "@/app/dashboard/factures/_id/details/page";
import FactureModifierPage from "@/app/dashboard/factures/_id/modifier/page";
import FacturesAvoirsPage from "@/app/dashboard/factures/avoirs/page";
import FacturesPaiementsPage from "@/app/dashboard/factures/paiements/page";

import PartenairesPage from "@/app/dashboard/partenaires/page";
import PartenaireNouveauPage from "@/app/dashboard/partenaires/nouveau/page";
import PartenaireDetailsPage from "@/app/dashboard/partenaires/_id/details/page";
import PartenaireModifierPage from "@/app/dashboard/partenaires/_id/modifier/page";

import ProduitsPage from "@/app/dashboard/produits/page";
import ProduitNouveauPage from "@/app/dashboard/produits/nouveau/page";
import ProduitDetailsPage from "@/app/dashboard/produits/_id/details/page";
import ProduitModifierPage from "@/app/dashboard/produits/_id/modifier/page";
import ProduitsCategoriesPage from "@/app/dashboard/produits/categories/page";
import ProduitsUnitesPage from "@/app/dashboard/produits/unites/page";

import EmplacementsPage from "@/app/dashboard/stock/emplacements/page";
import EmplacementNouveauPage from "@/app/dashboard/stock/emplacements/nouveau/page";
import EmplacementDetailsPage from "@/app/dashboard/stock/emplacements/_id/details/page";
import EmplacementModifierPage from "@/app/dashboard/stock/emplacements/_id/modifier/page";

import LotsPage from "@/app/dashboard/stock/lots/page";
import LotNouveauPage from "@/app/dashboard/stock/lots/nouveau/page";
import LotDetailsPage from "@/app/dashboard/stock/lots/_id/details/page";
import LotModifierPage from "@/app/dashboard/stock/lots/_id/modifier/page";

import QuantitesPage from "@/app/dashboard/stock/quantites/page";
import QuantiteNouveauPage from "@/app/dashboard/stock/quantites/nouveau/page";

import TransfertsPage from "@/app/dashboard/stock/transferts/page";
import TransfertNouveauPage from "@/app/dashboard/stock/transferts/nouveau/page";
import TransfertDetailsPage from "@/app/dashboard/stock/transferts/_id/details/page";

import UtilisateursPage from "@/app/dashboard/utilisateurs/page";
import UtilisateurNouveauPage from "@/app/dashboard/utilisateurs/nouveau/page";
import UtilisateurDetailsPage from "@/app/dashboard/utilisateurs/_id/details/page";
import UtilisateursPermissionsPage from "@/app/dashboard/utilisateurs/permissions/page";
import UtilisateurPermissionNouveauPage from "@/app/dashboard/utilisateurs/permissions/nouveau/page";
import UtilisateursRolesPage from "@/app/dashboard/utilisateurs/roles/page";
import UtilisateurRoleNouveauPage from "@/app/dashboard/utilisateurs/roles/nouveau/page";

import CommandesAchatPage from "@/app/achats/commandes/page";
import CommandeAchatNouveauPage from "@/app/achats/commandes/nouveau/page";
import CommandeAchatDetailsPage from "@/app/achats/commandes/_id/details/page";
import CommandeAchatModifierPage from "@/app/achats/commandes/_id/modifier/page";
import AchatsReceptionsPage from "@/app/achats/receptions/page";

import CommandesVentePage from "@/app/ventes/commandes/page";
import CommandeVenteNouveauPage from "@/app/ventes/commandes/nouveau/page";
import CommandeVenteDetailsPage from "@/app/ventes/commandes/_id/details/page";
import CommandeVenteModifierPage from "@/app/ventes/commandes/_id/modifier/page";

import FacturesAliasPage from "@/app/factures/page";
import FacturesAvoirsAliasPage from "@/app/factures/avoirs/page";
import FacturesPaiementsAliasPage from "@/app/factures/paiements/page";

import PartenairesAliasPage from "@/app/partenaires/page";
import PartenaireNouveauAliasPage from "@/app/partenaires/nouveau/page";

import UtilisateursAliasPage from "@/app/utilisateurs/page";
import UtilisateursRolesAliasPage from "@/app/utilisateurs/roles/page";
import UtilisateursPermissionsAliasPage from "@/app/utilisateurs/permissions/page";

import RapportsPage from "@/app/rapports/page";
import RapportStockPage from "@/app/rapports/stock/page";
import RapportsMouvementsPage from "@/app/rapports/mouvements/page";
import RapportsTracabilitePage from "@/app/rapports/tracabilite/page";
import RapportsLogsPage from "@/app/rapports/logs/page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootLoginPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<AuthLoginPage />} />
          <Route path="/login" element={<AuthLoginPage />} />
        </Route>

        {/* Protege */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/dashboard/inventaire" element={<InventaireListPage />} />
          <Route path="/dashboard/inventaire/:id" element={<InventaireDetailPage />} />
          <Route path="/dashboard/societes" element={<SocietesPage />} />
          <Route path="/dashboard/pos" element={<PosPage />} />
          <Route path="/dashboard/parametres" element={<ParametresPage />} />
          <Route path="/dashboard/profil" element={<ProfilPage />} />

          <Route path="/dashboard/factures" element={<FacturesPage />} />
          <Route path="/dashboard/factures/nouveau" element={<FactureNouveauPage />} />
          <Route path="/dashboard/factures/avoirs" element={<FacturesAvoirsPage />} />
          <Route path="/dashboard/factures/paiements" element={<FacturesPaiementsPage />} />
          <Route path="/dashboard/factures/:id/details" element={<FactureDetailsPage />} />
          <Route path="/dashboard/factures/:id/modifier" element={<FactureModifierPage />} />

          <Route path="/dashboard/partenaires" element={<PartenairesPage />} />
          <Route path="/dashboard/partenaires/nouveau" element={<PartenaireNouveauPage />} />
          <Route path="/dashboard/partenaires/:id/details" element={<PartenaireDetailsPage />} />
          <Route path="/dashboard/partenaires/:id/modifier" element={<PartenaireModifierPage />} />

          <Route path="/dashboard/produits" element={<ProduitsPage />} />
          <Route path="/dashboard/produits/nouveau" element={<ProduitNouveauPage />} />
          <Route path="/dashboard/produits/categories" element={<ProduitsCategoriesPage />} />
          <Route path="/dashboard/produits/unites" element={<ProduitsUnitesPage />} />
          <Route path="/dashboard/produits/:id/details" element={<ProduitDetailsPage />} />
          <Route path="/dashboard/produits/:id/modifier" element={<ProduitModifierPage />} />

          <Route path="/dashboard/stock/emplacements" element={<EmplacementsPage />} />
          <Route path="/dashboard/stock/emplacements/nouveau" element={<EmplacementNouveauPage />} />
          <Route path="/dashboard/stock/emplacements/:id/details" element={<EmplacementDetailsPage />} />
          <Route path="/dashboard/stock/emplacements/:id/modifier" element={<EmplacementModifierPage />} />

          <Route path="/dashboard/stock/lots" element={<LotsPage />} />
          <Route path="/dashboard/stock/lots/nouveau" element={<LotNouveauPage />} />
          <Route path="/dashboard/stock/lots/:id/details" element={<LotDetailsPage />} />
          <Route path="/dashboard/stock/lots/:id/modifier" element={<LotModifierPage />} />

          <Route path="/dashboard/stock/quantites" element={<QuantitesPage />} />
          <Route path="/dashboard/stock/quantites/nouveau" element={<QuantiteNouveauPage />} />

          <Route path="/dashboard/stock/transferts" element={<TransfertsPage />} />
          <Route path="/dashboard/stock/transferts/nouveau" element={<TransfertNouveauPage />} />
          <Route path="/dashboard/stock/transferts/:id/details" element={<TransfertDetailsPage />} />

          <Route path="/dashboard/utilisateurs" element={<UtilisateursPage />} />
          <Route path="/dashboard/utilisateurs/nouveau" element={<UtilisateurNouveauPage />} />
          <Route path="/dashboard/utilisateurs/:id/details" element={<UtilisateurDetailsPage />} />
          <Route path="/dashboard/utilisateurs/permissions" element={<UtilisateursPermissionsPage />} />
          <Route path="/dashboard/utilisateurs/permissions/nouveau" element={<UtilisateurPermissionNouveauPage />} />
          <Route path="/dashboard/utilisateurs/roles" element={<UtilisateursRolesPage />} />
          <Route path="/dashboard/utilisateurs/roles/nouveau" element={<UtilisateurRoleNouveauPage />} />

          <Route path="/achats/commandes" element={<CommandesAchatPage />} />
          <Route path="/achats/commandes/nouveau" element={<CommandeAchatNouveauPage />} />
          <Route path="/achats/commandes/:id/details" element={<CommandeAchatDetailsPage />} />
          <Route path="/achats/commandes/:id/modifier" element={<CommandeAchatModifierPage />} />
          <Route path="/achats/receptions" element={<AchatsReceptionsPage />} />

          <Route path="/ventes/commandes" element={<CommandesVentePage />} />
          <Route path="/ventes/commandes/nouveau" element={<CommandeVenteNouveauPage />} />
          <Route path="/ventes/commandes/:id/details" element={<CommandeVenteDetailsPage />} />
          <Route path="/ventes/commandes/:id/modifier" element={<CommandeVenteModifierPage />} />

          <Route path="/factures" element={<FacturesAliasPage />} />
          <Route path="/factures/avoirs" element={<FacturesAvoirsAliasPage />} />
          <Route path="/factures/paiements" element={<FacturesPaiementsAliasPage />} />

          <Route path="/partenaires" element={<PartenairesAliasPage />} />
          <Route path="/partenaires/nouveau" element={<PartenaireNouveauAliasPage />} />

          <Route path="/utilisateurs" element={<UtilisateursAliasPage />} />
          <Route path="/utilisateurs/roles" element={<UtilisateursRolesAliasPage />} />
          <Route path="/utilisateurs/permissions" element={<UtilisateursPermissionsAliasPage />} />

          <Route path="/rapports" element={<RapportsPage />} />
          <Route path="/rapports/stock" element={<RapportStockPage />} />
          <Route path="/rapports/ventes-vendeurs" element={<RapportVendeursPage />} />
          <Route path="/rapports/ventes-vendeurs/:id" element={<RapportVendeurDetailsPage />} />
          <Route path="/rapports/mouvements" element={<RapportsMouvementsPage />} />
          <Route path="/rapports/tracabilite" element={<RapportsTracabilitePage />} />
          <Route path="/rapports/logs" element={<RapportsLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
