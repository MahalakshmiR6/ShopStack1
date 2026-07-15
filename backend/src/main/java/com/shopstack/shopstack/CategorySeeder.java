package com.shopstack.shopstack;

import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public CategorySeeder(CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          VendorProfileRepository vendorProfileRepository,
                          ProductRepository productRepository,
                          PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // System.out.println("Checking and seeding default categories...");

        List<Category> defaultCategories = Arrays.asList(
                Category.builder().name("Electronics").slug("electronics").build(),
                Category.builder().name("Fashion").slug("fashion").build(),
                Category.builder().name("Home & Kitchen").slug("home-kitchen").build(),
                Category.builder().name("Books").slug("books").build(),
                Category.builder().name("Sports & Outdoors").slug("sports-outdoors").build(),
                Category.builder().name("Beauty & Care").slug("beauty-care").build(),
                Category.builder().name("Toys & Games").slug("toys-games").build(),
                Category.builder().name("Groceries").slug("groceries").build()
        );

        for (Category cat : defaultCategories) {
            if (categoryRepository.findBySlug(cat.getSlug()).isEmpty()) {
                categoryRepository.save(cat);
                System.out.println("Seeded category: " + cat.getName());
            }
        }
        // System.out.println("Category seeding check complete!");

        // Seed default admin
        User adminUser = userRepository.findByEmail("admin1@shopstack.com").orElse(null);
        if (adminUser == null) {
            adminUser = User.builder()
                    .email("admin1@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("Boss")
                    .lastName("Admin")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            System.out.println("Seeded admin: admin1@shopstack.com / Admin@123");
        }

        // Seed default vendor
        User vendorUser = userRepository.findByEmail("vendor1@shopstack.com").orElse(null);
        if (vendorUser == null) {
            vendorUser = User.builder()
                    .email("vendor1@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Vendor@123"))
                    .firstName("Jane")
                    .lastName("Vendor")
                    .role(Role.VENDOR)
                    .isActive(true)
                    .build();
            vendorUser = userRepository.save(vendorUser);
            System.out.println("Seeded default vendor user.");
        }

        VendorProfile vendorProfile = vendorProfileRepository.findByUserId(vendorUser.getId()).orElse(null);
        if (vendorProfile == null) {
            vendorProfile = VendorProfile.builder()
                    .user(vendorUser)
                    .storeName("ShopStack Emporium")
                    .description("The primary flagship store of ShopStack, providing a massive variety of goods.")
                    .businessLicense("LIC-998822")
                    .taxId("TAX-772211")
                    .status(VendorStatus.APPROVED)
                    .commissionRate(new BigDecimal("0.10"))
                    .build();
            vendorProfile = vendorProfileRepository.save(vendorProfile);
            System.out.println("Seeded default vendor profile.");
        }

        // Seed products if table is empty
        if (productRepository.count() == 0) {
            System.out.println("Seeding default products for categories...");

            // Fetch categories from DB to get populated IDs
            Category electronics = categoryRepository.findBySlug("electronics").orElseThrow();
            Category fashion = categoryRepository.findBySlug("fashion").orElseThrow();
            Category homeKitchen = categoryRepository.findBySlug("home-kitchen").orElseThrow();
            Category books = categoryRepository.findBySlug("books").orElseThrow();
            Category sportsOutdoors = categoryRepository.findBySlug("sports-outdoors").orElseThrow();
            Category beautyCare = categoryRepository.findBySlug("beauty-care").orElseThrow();
            Category toysGames = categoryRepository.findBySlug("toys-games").orElseThrow();
            Category groceries = categoryRepository.findBySlug("groceries").orElseThrow();

            seedProduct(vendorProfile, electronics, "SuperPhone X12", "superphone-x12", "Electra", 
                    "A powerful next-gen smartphone with 120Hz display and 108MP camera.", new BigDecimal("69999.00"), 50, 
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, electronics, "AeroBook Pro", "aerobook-pro", "Aero", 
                    "Light, fast laptop with 16GB RAM, 512GB SSD, and high-res screen.", new BigDecimal("84999.00"), 30, 
                    "https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, fashion, "Classic Leather Jacket", "classic-leather-jacket", "Vogue", 
                    "Premium cowhide leather jacket in sleek black finish.", new BigDecimal("4999.00"), 40, 
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, fashion, "Active Knit Sneakers", "active-knit-sneakers", "Stride", 
                    "Breathable running shoes designed for ultimate comfort.", new BigDecimal("2999.00"), 60, 
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, homeKitchen, "Smart Drip Coffee Maker", "smart-drip-coffee-maker", "BrewMaster", 
                    "Programmable coffee machine with built-in burr grinder.", new BigDecimal("7999.00"), 25, 
                    "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, homeKitchen, "Chef's Cast Iron Skillet", "chefs-cast-iron-skillet", "IronCraft", 
                    "Pre-seasoned 12-inch heavy duty cast iron skillet.", new BigDecimal("1899.00"), 45, 
                    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, books, "The AI Horizon", "the-ai-horizon", "FuturePress", 
                    "A deep dive into the future of artificial general intelligence.", new BigDecimal("499.00"), 100, 
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, books, "Culinary Journeys", "culinary-journeys", "GourmetMedia", 
                    "Explore authentic recipes from 20 different cultures.", new BigDecimal("999.00"), 75, 
                    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, sportsOutdoors, "Pro-Grip Tennis Racket", "pro-grip-tennis-racket", "SpinFire", 
                    "Lightweight carbon fiber racket for maximum spin and power.", new BigDecimal("4500.00"), 20, 
                    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, sportsOutdoors, "Waterproof Camping Tent", "waterproof-camping-tent", "PeakWild", 
                    "4-person double layer dome tent for hiking and outdoor trips.", new BigDecimal("6200.00"), 15, 
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, beautyCare, "Hydrating Facial Serum", "hydrating-facial-serum", "GlowLab", 
                    "Pure hyaluronic acid serum for deep skin hydration.", new BigDecimal("1299.00"), 80, 
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, beautyCare, "Organic Rosewater Mist", "organic-rosewater-mist", "GlowLab", 
                    "Natural toning spray made with pure distilled rose petals.", new BigDecimal("699.00"), 120, 
                    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, toysGames, "Wooden Block Castle Set", "wooden-block-castle-set", "PlayTime", 
                    "75-piece solid wood building blocks for creative play.", new BigDecimal("1499.00"), 40, 
                    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, toysGames, "CyberRacer RC Buggy", "cyberracer-rc-buggy", "SpeedX", 
                    "High-speed all-terrain remote control racing car.", new BigDecimal("3499.00"), 35, 
                    "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, groceries, "Premium Roasted Almonds", "premium-roasted-almonds", "Natura", 
                    "Freshly harvested, lightly salted California almonds.", new BigDecimal("799.00"), 150, 
                    "https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600&auto=format&fit=crop&q=80");

            seedProduct(vendorProfile, groceries, "Extra Virgin Olive Oil", "extra-virgin-olive-oil", "Natura", 
                    "Cold-pressed Italian olive oil for cooking and salads.", new BigDecimal("1199.00"), 90, 
                    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80");

            System.out.println("Default products seeding complete!");
        }
    }

    private void seedProduct(VendorProfile vendor, Category category, String name, String slug, String brand, 
                             String description, BigDecimal price, int stock, String imageUrl) {
        Product product = Product.builder()
                .vendor(vendor)
                .category(category)
                .name(name)
                .slug(slug + "-" + UUID.randomUUID().toString().substring(0, 6))
                .brand(brand)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .status(ProductStatus.APPROVED)
                .images(new ArrayList<>())
                .reviews(new ArrayList<>())
                .build();

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isPrimary(true)
                .build();

        product.getImages().add(image);
        productRepository.save(product);
    }
}
