import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GrainOverlay from './components/GrainOverlay';
import HomePage from './pages/HomePage';
import RecipeSearchPage from './pages/RecipeSearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import MealPlanPage from './pages/MealPlanPage';
import CookbookPage from './pages/CookbookPage';
import ProfilePage from './pages/ProfilePage';
import FavouritesPage from './pages/FavouritesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <>
      <GrainOverlay />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="recipes" element={<RecipeSearchPage />} />
            <Route path="recipes/:id" element={<RecipeDetailPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route path="cookbook" element={<CookbookPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="favourites" element={<FavouritesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
