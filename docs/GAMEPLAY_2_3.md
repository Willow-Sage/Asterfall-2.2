# Asterfall 2.3 — Serenova Gameplay Specification

The game's immediate loop is **explore → gather → craft → contribute → see a persistent settlement improvement → trade or rest → repeat**.

The intro is an orchard-to-granary commission: speaking to the steward begins the order; citrus trees provide two items apiece; the forester provides timber; the carpenter requires three timber for a crate; the granary consumes six citrus and one crate. Delivery stocks the market with six goods and rewards 28 crowns, 12 reputation, and Commerce XP. The market trades those supplies for honey at eight crowns per unit; trade consumes one market stock. Revisiting the steward after a completed delivery begins the next in-game day, refreshing trees and the timber pile. Save data is a browser-local versioned GameState.

The 12 professions and six core skills remain canonical: Farmer, Fisher, Miner, Carpenter, Mason, Smith, Tailor, Potter, Cook, Herbalist, Merchant, Mage; Gathering, Cultivation, Craftsmanship, Construction, Scholarship, Commerce. This vertical slice exercises five of these skills and makes no claim to have shipped all profession systems.

Future expansion: approved source assets, animation clips, dynamic NPC household activities, authored architecture/collision, public works construction, more villages, server-backed sync. Current NPC meshes and environment are provisional only. Solterran lore and costuming must be checked against the World Wiki before admitting final game art.