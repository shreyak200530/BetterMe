import { useState, useEffect } from 'react';
import { supabase, Profile, CharacterItem } from '../lib/supabase';
import { ShoppingBag, Lock, Check } from 'lucide-react';

interface CharacterShopProps {
  profile: Profile;
  onUpdate: () => Promise<void>;
}

const categoryLabels = {
  hat: 'Hats & Headwear',
  shirt: 'Clothing',
  accessory: 'Accessories',
  effect: 'Special Effects',
  companion: 'Companions',
};

export default function CharacterShop({ profile, onUpdate }: CharacterShopProps) {
  const [items, setItems] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('character_items')
        .select('*')
        .order('required_level', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: CharacterItem) => {
    if (profile.coins < item.coin_cost) {
      alert('Not enough coins!');
      return;
    }

    if (profile.character_level < item.required_level) {
      alert(`You need to be level ${item.required_level} to unlock this item!`);
      return;
    }

    try {
      const newUnlocked = [...profile.unlocked_items, item.id];
      const newCoins = profile.coins - item.coin_cost;

      const { error } = await supabase
        .from('profiles')
        .update({
          unlocked_items: newUnlocked,
          coins: newCoins,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await onUpdate();
    } catch (error) {
      console.error('Error purchasing item:', error);
    }
  };

  const handleEquip = async (item: CharacterItem) => {
    try {
      const currentEquipped = profile.equipped_items || [];
      const sameCategory = currentEquipped.filter((id) => {
        const equipped = items.find((i) => i.id === id);
        return equipped && equipped.category !== item.category;
      });

      const newEquipped = [...sameCategory, item.id];

      const { error } = await supabase
        .from('profiles')
        .update({ equipped_items: newEquipped })
        .eq('id', profile.id);

      if (error) throw error;

      await onUpdate();
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequip = async (item: CharacterItem) => {
    try {
      const newEquipped = profile.equipped_items.filter((id) => id !== item.id);

      const { error } = await supabase
        .from('profiles')
        .update({ equipped_items: newEquipped })
        .eq('id', profile.id);

      if (error) throw error;

      await onUpdate();
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const isUnlocked = (itemId: string) => profile.unlocked_items?.includes(itemId);
  const isEquipped = (itemId: string) => profile.equipped_items?.includes(itemId);
  const canUnlock = (item: CharacterItem) =>
    profile.character_level >= item.required_level && profile.coins >= item.coin_cost;

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const categories = ['all', 'hat', 'shirt', 'accessory', 'effect', 'companion'];

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading shop...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Character Shop</h2>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border-2 border-slate-700">
          <ShoppingBag className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-bold text-yellow-400">{profile.coins}</span>
          <span className="text-slate-400">coins</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              selectedCategory === category
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {category === 'all' ? 'All Items' : categoryLabels[category as keyof typeof categoryLabels]}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const unlocked = isUnlocked(item.id);
          const equipped = isEquipped(item.id);
          const locked = !unlocked && !canUnlock(item);

          return (
            <div
              key={item.id}
              className={`bg-slate-800 rounded-xl border-2 p-6 transition-all ${
                equipped
                  ? 'border-emerald-500'
                  : locked
                  ? 'border-slate-700 opacity-60'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-sm capitalize">{item.category}</p>
                </div>
                {equipped && (
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-slate-400 text-sm mb-4">{item.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Level {item.required_level}</span>
                </div>
                {item.coin_cost > 0 && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{item.coin_cost} coins</span>
                  </div>
                )}
              </div>

              <div>
                {!unlocked ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={locked}
                    className={`w-full px-4 py-2 rounded-lg font-bold transition-all ${
                      locked
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white transform hover:scale-105'
                    }`}
                  >
                    {profile.character_level < item.required_level
                      ? `Requires Level ${item.required_level}`
                      : profile.coins < item.coin_cost
                      ? 'Not Enough Coins'
                      : item.coin_cost === 0
                      ? 'Unlock'
                      : 'Purchase'}
                  </button>
                ) : equipped ? (
                  <button
                    onClick={() => handleUnequip(item)}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
                  >
                    Unequip
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquip(item)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
