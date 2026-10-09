package database

import (
	"log"
	"steam-backend/internal/games"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) {
	var count int64
	db.Model(&games.Game{}).Count(&count)
	if count > 0 {
		log.Printf("Database already contains %d games, skipping seed.", count)
		return
	}

	log.Println("Seeding Steam AAA titles and community reviews into PostgreSQL...")

	seedGames := []struct {
		game    games.Game
		reviews []games.Review
	}{
		{
			game: games.Game{
				Title:            "Cyberpunk 2077",
				Slug:             "cyberpunk-2077",
				Edition:          "Ultimate Edition",
				ShortDescription: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.",
				Description:      "Become an urban mercenary equipped with cybernetic enhancements and build your legend on the streets of Night City. Explore the vast city, customize your character's cyberware, skillset, and playstyle, and take on daring jobs for fixer factions. Upgraded with next-gen visual fidelity, full path-tracing support, revised skill trees, and vehicular combat.",
				Price:            59.99,
				DiscountPercent:  50,
				BannerURL:        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80",
				ThumbnailURL:     "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
				Screenshots: pq.StringArray{
					"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
				},
				Genres:        pq.StringArray{"Open World", "RPG", "Sci-Fi", "Cyberpunk", "Action"},
				DeveloperID:   1,
				DeveloperName: "CD PROJEKT RED",
				PublisherName: "CD PROJEKT RED",
				ReleaseDate:   "Dec 10, 2020",
				ReviewStatus:  "Very Positive",
				ReviewCount:   "652,890 reviews",
				MinOS:         "Windows 10 64-bit",
				MinProcessor:  "Intel Core i7-6700 or AMD Ryzen 5 1600",
				MinMemory:     "12 GB RAM",
				MinGraphics:   "NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB",
				MinStorage:    "70 GB available space (SSD required)",
				RecOS:         "Windows 10/11 64-bit",
				RecProcessor:  "Intel Core i7-12700 or AMD Ryzen 7 7800X3D",
				RecMemory:     "16 GB RAM",
				RecGraphics:   "NVIDIA GeForce RTX 3080 or AMD Radeon RX 6800 XT",
				RecStorage:    "70 GB available space (NVMe SSD)",
				Status:        games.StatusApproved,
				IsFeatured:    true,
				IsPublished:   true,
			},
			reviews: []games.Review{
				{
					AuthorName:    "Neo_Runner",
					AuthorAvatar:  "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "148.5 hrs",
					Content:       "With update 2.0 and Phantom Liberty, this game is nothing short of a masterpiece. Night City feels alive, dangerous, and deeply atmospheric. Must-play on PC.",
					HelpfulCount:  342,
					FunnyCount:    12,
				},
				{
					AuthorName:    "Deckard99",
					AuthorAvatar:  "https://avatars.steamstatic.com/d94943fcf3cb6d860d5e8ef6344de0dcfc3070cd_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "62.1 hrs",
					Content:       "The ray tracing audio and visual overhaul made my jaw drop. Dogtown storytelling is top-tier writing.",
					HelpfulCount:  118,
					FunnyCount:    4,
				},
			},
		},
		{
			game: games.Game{
				Title:            "Elden Ring: Shadow of the Erdtree",
				Slug:             "elden-ring",
				Edition:          "Deluxe Edition",
				ShortDescription: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
				Description:      "A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected. As you explore, the joy of discovering unknown and overwhelming threats awaits you, leading to a high sense of accomplishment.",
				Price:            59.99,
				DiscountPercent:  30,
				BannerURL:        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
				ThumbnailURL:     "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
				Screenshots: pq.StringArray{
					"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
				},
				Genres:        pq.StringArray{"Souls-like", "Dark Fantasy", "RPG", "Open World", "Difficult"},
				DeveloperID:   1,
				DeveloperName: "FromSoftware Inc.",
				PublisherName: "Bandai Namco Entertainment",
				ReleaseDate:   "Feb 25, 2022",
				ReviewStatus:  "Overwhelmingly Positive",
				ReviewCount:   "912,400 reviews",
				MinOS:         "Windows 10 64-bit",
				MinProcessor:  "INTEL CORE I5-8400 or AMD RYZEN 3 3300X",
				MinMemory:     "12 GB RAM",
				MinGraphics:   "NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB",
				MinStorage:    "60 GB available space",
				RecOS:         "Windows 10/11 64-bit",
				RecProcessor:  "INTEL CORE I7-8700K or AMD RYZEN 5 3600X",
				RecMemory:     "16 GB RAM",
				RecGraphics:   "NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB",
				RecStorage:    "60 GB available space (SSD)",
				Status:        games.StatusApproved,
				IsFeatured:    true,
				IsPublished:   true,
			},
			reviews: []games.Review{
				{
					AuthorName:    "LetMeSoloHim",
					AuthorAvatar:  "https://avatars.steamstatic.com/d94943fcf3cb6d860d5e8ef6344de0dcfc3070cd_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "389.2 hrs",
					Content:       "Died 400 times to Malenia and Messmer. Would do it all over again. 11/10 GOTY.",
					HelpfulCount:  890,
					FunnyCount:    215,
				},
			},
		},
		{
			game: games.Game{
				Title:            "Black Myth: Wukong",
				Slug:             "black-myth-wukong",
				Edition:          "Standard Edition",
				ShortDescription: "Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead.",
				Description:      "Uncover the obscured truth beneath the veil of a glorious legend from the past. Venture into a fascinating realm filled with Chinese mythology lore, master diverse staff fighting styles, cast spells, and test your mettle against legendary adversaries.",
				Price:            59.99,
				DiscountPercent:  0,
				BannerURL:        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1920&q=80",
				ThumbnailURL:     "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80",
				Screenshots: pq.StringArray{
					"https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
				},
				Genres:        pq.StringArray{"Action", "Mythology", "Singleplayer", "Souls-like", "RPG"},
				DeveloperID:   1,
				DeveloperName: "Game Science",
				PublisherName: "Game Science",
				ReleaseDate:   "Aug 20, 2024",
				ReviewStatus:  "Overwhelmingly Positive",
				ReviewCount:   "730,120 reviews",
				MinOS:         "Windows 10 64-bit",
				MinProcessor:  "Intel Core i5-8400 / AMD Ryzen 5 1600",
				MinMemory:     "16 GB RAM",
				MinGraphics:   "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB",
				MinStorage:    "130 GB available space",
				RecOS:         "Windows 10/11 64-bit",
				RecProcessor:  "Intel Core i7-9700 / AMD Ryzen 5 5500",
				RecMemory:     "16 GB RAM",
				RecGraphics:   "NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700 XT",
				RecStorage:    "130 GB available space (SSD)",
				Status:        games.StatusApproved,
				IsFeatured:    true,
				IsPublished:   true,
			},
			reviews: []games.Review{
				{
					AuthorName:    "Sun_Wukong_Fan",
					AuthorAvatar:  "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "48.0 hrs",
					Content:       "Unreal Engine 5 visuals are unprecedented. Boss designs and combat variety exceed all expectations.",
					HelpfulCount:  210,
					FunnyCount:    8,
				},
			},
		},
		{
			game: games.Game{
				Title:            "Counter-Strike 2",
				Slug:             "counter-strike-2",
				Edition:          "Prime Status Upgrade",
				ShortDescription: "For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe.",
				Description:      "Counter-Strike 2 is the largest technical leap forward in Counter-Strike's history, ensuring new features and updates for years to come. Built on the Source 2 engine, featuring responsive smoke grenades, sub-tick server architecture, and upgraded maps.",
				Price:            0.00,
				DiscountPercent:  0,
				BannerURL:        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
				ThumbnailURL:     "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
				Screenshots: pq.StringArray{
					"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
				},
				Genres:        pq.StringArray{"FPS", "Shooter", "Multiplayer", "Competitive", "Tactical", "eSports"},
				DeveloperID:   1,
				DeveloperName: "Valve",
				PublisherName: "Valve",
				ReleaseDate:   "Sep 27, 2023",
				ReviewStatus:  "Very Positive",
				ReviewCount:   "3,820,000 reviews",
				MinOS:         "Windows 10 64-bit",
				MinProcessor:  "4 hardware CPU threads - Intel® Core™ i5 750 or higher",
				MinMemory:     "8 GB RAM",
				MinGraphics:   "Video card must be 1 GB or more and should be DirectX 11-compatible",
				MinStorage:    "85 GB available space",
				RecOS:         "Windows 10/11 64-bit",
				RecProcessor:  "Intel Core i7-9700k or AMD Ryzen 7 5800X",
				RecMemory:     "16 GB RAM",
				RecGraphics:   "NVIDIA GeForce RTX 3060 / AMD Radeon 6700XT",
				RecStorage:    "85 GB SSD",
				Status:        games.StatusApproved,
				IsFeatured:    true,
				IsPublished:   true,
			},
			reviews: []games.Review{
				{
					AuthorName:    "Clutch_King",
					AuthorAvatar:  "https://avatars.steamstatic.com/d94943fcf3cb6d860d5e8ef6344de0dcfc3070cd_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "2,410.5 hrs",
					Content:       "The volumetric smoke interactions change every clutch round. Best competitive shooter ever made.",
					HelpfulCount:  512,
					FunnyCount:    84,
				},
			},
		},
		{
			game: games.Game{
				Title:            "Baldur's Gate 3",
				Slug:             "baldurs-gate-3",
				Edition:          "Digital Deluxe Edition",
				ShortDescription: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
				Description:      "Choose from 12 classes and 11 races from the D&D Player's Handbook and create your own identity, or play as an Origin hero with a hand-crafted background. Or tangle with your inner corruption as the Dark Urge.",
				Price:            59.99,
				DiscountPercent:  20,
				BannerURL:        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80",
				ThumbnailURL:     "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
				Screenshots: pq.StringArray{
					"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
					"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
				},
				Genres:        pq.StringArray{"RPG", "Story Rich", "Turn-Based", "Dungeons & Dragons", "Choices Matter"},
				DeveloperID:   1,
				DeveloperName: "Larian Studios",
				PublisherName: "Larian Studios",
				ReleaseDate:   "Aug 3, 2023",
				ReviewStatus:  "Overwhelmingly Positive",
				ReviewCount:   "590,000 reviews",
				MinOS:         "Windows 10 64-bit",
				MinProcessor:  "Intel I5 4690 / AMD FX 8350",
				MinMemory:     "8 GB RAM",
				MinGraphics:   "Nvidia GTX 970 / RX 480 (4GB+ of VRAM)",
				MinStorage:    "150 GB available space",
				RecOS:         "Windows 10/11 64-bit",
				RecProcessor:  "Intel i7 8700K / AMD r5 3600",
				RecMemory:     "16 GB RAM",
				RecGraphics:   "Nvidia 2060 Super / RX 5700 XT (8GB+ of VRAM)",
				RecStorage:    "150 GB available space (SSD)",
				Status:        games.StatusApproved,
				IsFeatured:    false,
				IsPublished:   true,
			},
			reviews: []games.Review{
				{
					AuthorName:    "Tav_Adventurer",
					AuthorAvatar:  "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
					IsRecommended: true,
					PlaytimeHours: "210.0 hrs",
					Content:       "The freedom in dialogue and combat is mind-boggling. Unquestionably one of the greatest RPGs in video game history.",
					HelpfulCount:  429,
					FunnyCount:    19,
				},
			},
		},
	}

	for _, item := range seedGames {
		if err := db.Create(&item.game).Error; err != nil {
			log.Printf("Failed to seed game %s: %v", item.game.Title, err)
			continue
		}
		for _, rev := range item.reviews {
			rev.GameID = item.game.ID
			rev.UserID = 1
			_ = db.Create(&rev)
		}
	}
	log.Println("Steam store database seeded successfully!")
}
