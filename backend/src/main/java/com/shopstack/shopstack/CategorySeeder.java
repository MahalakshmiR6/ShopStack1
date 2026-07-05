package com.shopstack.shopstack;

import com.shopstack.shopstack.model.Category;
import com.shopstack.shopstack.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking and seeding default categories...");

        List<Category> defaultCategories = Arrays.asList(
                Category.builder().name("Electronics").slug("electronics").build(),
                Category.builder().name("Fashion").slug("fashion").build(),
                Category.builder().name("Home & Kitchen").slug("home-kitchen").build(),
                Category.builder().name("Books").slug("books").build(),
                Category.builder().name("Sports & Outdoors").slug("sports-outdoors").build()
        );

        for (Category cat : defaultCategories) {
            if (categoryRepository.findBySlug(cat.getSlug()).isEmpty()) {
                categoryRepository.save(cat);
                System.out.println("Seeded category: " + cat.getName());
            }
        }
        System.out.println("Category seeding check complete!");
    }
}
