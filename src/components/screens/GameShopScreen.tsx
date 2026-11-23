import React, { useState } from 'react';
import {
  Bot,
  Car,
  Check,
  Coins,
  Palette,
  Shirt,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  ChildProfile,
  LanguageCode,
  SHOP_CATALOG,
  ShopCategory,
  ShopItem,
} from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';
import { GameButton } from '../gaming/GameButton';
import { GameCard } from '../gaming/GameCard';
import { MascotAvatar } from '../gaming/MascotAvatar';

interface GameShopScreenProps {
  profile: ChildProfile;
  lang: LanguageCode;
  onBuyItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
}

const CATEGORY_FILTERS: Array<{
  id: ShopCategory | 'all';
  en: string;
  hi: string;
}> = [
  { id: 'all', en: 'All Gear', hi: 'सभी सामान' },
  { id: 'outfit', en: 'Mascot Outfits', hi: 'पोशाक' },
  { id: 'robot_skin', en: 'Robot Skins', hi: 'रोबोट स्किन' },
  { id: 'car_skin', en: 'Car Skins', hi: 'कार स्किन' },
  { id: 'accessory', en: 'Accessories', hi: 'एक्सेसरी' },
  { id: 'env_theme', en: 'Themes', hi: 'थीम' },
];

function getCategoryIcon(cat: ShopCategory) {
  switch (cat) {
    case 'outfit':
      return <Shirt className="w-5 h-5" />;
    case 'robot_skin':
      return <Bot className="w-5 h-5" />;
    case 'car_skin':
      return <Car className="w-5 h-5" />;
    case 'accessory':
      return <Sparkles className="w-5 h-5" />;
    case 'env_theme':
      return <Palette className="w-5 h-5" />;
  }
}

export const GameShopScreen: React.FC<GameShopScreenProps> = ({
  profile,
  lang,
  onBuyItem,
  onEquipItem,
}) => {
  const t = getTranslations(lang);
  const [filter, setFilter] = useState<ShopCategory | 'all'>('all');
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  const items =
    filter === 'all'
      ? SHOP_CATALOG
      : SHOP_CATALOG.filter((item) => item.category === filter);

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'outfit' && item.outfitId) {
      return profile.equippedOutfit === item.outfitId;
    }
    if (item.category === 'robot_skin') return profile.equippedCosmetics?.robotSkin === item.id;
    if (item.category === 'car_skin') return profile.equippedCosmetics?.carSkin === item.id;
    if (item.category === 'accessory') return profile.equippedCosmetics?.accessory === item.id;
    if (item.category === 'env_theme') return profile.equippedCosmetics?.envTheme === item.id;
    return false;
  };

  const previewOutfit =
    previewItem?.category === 'outfit' && previewItem.outfitId
      ? previewItem.outfitId
      : profile.equippedOutfit;
  const previewAccessory =
    previewItem?.category === 'accessory'
      ? previewItem.id
      : profile.equippedCosmetics?.accessory;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      {/* Shop Header & Live Preview */}
      <div className="gaming-panel rounded-[var(--radius-panel)] p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <MascotAvatar
            mascotId={profile.mascot}
            outfit={previewOutfit}
            accessory={previewAccessory}
            size="lg"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#22D3EE]">
              <ShoppingBag className="w-4 h-4" />
              <span>{t.navShop}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5">
              {t.shopTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#AEBBD9] mt-0.5">
              {previewItem
                ? `${lang === 'hi' ? 'प्रीव्यू:' : 'Previewing:'} ${
                    lang === 'hi' ? previewItem.nameHi : previewItem.nameEn
                  }`
                : t.shopSubtitle}
            </p>
          </div>
        </div>

        <div className="bg-[#10152E] border border-[#22D3EE]/40 rounded-2xl px-5 py-3 flex items-center gap-3 self-start lg:self-auto shrink-0">
          <Coins className="w-7 h-7 text-[#22D3EE]" />
          <div>
            <p className="text-[11px] font-bold text-[#AEBBD9]">{t.coinsLabel}</p>
            <p className="text-2xl font-display font-bold text-[#22D3EE] tabular-nums">
              {profile.coins || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                audioService.playClick();
                setFilter(c.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                active
                  ? 'bg-[#287BFF] border-[#287BFF] text-white'
                  : 'bg-[#222E52] border-[#AEBBD9]/20 text-[#AEBBD9] hover:text-white'
              }`}
            >
              {lang === 'hi' ? c.hi : c.en}
            </button>
          );
        })}
      </div>

      {/* Shop Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const owned = profile.ownedShopItems?.includes(item.id);
          const equipped = isItemEquipped(item);
          const canAfford = (profile.coins || 0) >= item.costCoins;

          return (
            <GameCard
              key={item.id}
              glowColor={equipped ? '#35D982' : item.previewHex}
              onClick={() => setPreviewItem(item)}
              className="p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#10152E] shrink-0 shadow"
                  style={{
                    background: `linear-gradient(135deg, ${item.previewHex}, ${item.accentHex})`,
                  }}
                >
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-lg text-white">
                    {lang === 'hi' ? item.nameHi : item.nameEn}
                  </h3>
                  <p className="text-xs text-[#AEBBD9] mt-1">
                    {lang === 'hi' ? item.descriptionHi : item.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#AEBBD9]/15">
                {owned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-display font-bold text-[#35D982]">
                    <Check className="w-4 h-4" />
                    {t.ownedItem}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-base font-display font-bold text-[#22D3EE] tabular-nums">
                    <Coins className="w-4 h-4" />
                    {item.costCoins}
                  </span>
                )}

                {owned ? (
                  <GameButton
                    variant={equipped ? 'success' : 'primary'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEquipItem(item.id);
                    }}
                  >
                    {equipped ? t.equippedItem : t.equipItem}
                  </GameButton>
                ) : (
                  <GameButton
                    variant={canAfford ? 'yellow' : 'secondary'}
                    size="sm"
                    disabled={!canAfford}
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playCelebration();
                      onBuyItem(item.id);
                    }}
                  >
                    {canAfford ? t.buyItem : t.notEnoughCoins}
                  </GameButton>
                )}
              </div>
            </GameCard>
          );
        })}
      </div>
    </div>
  );
};
