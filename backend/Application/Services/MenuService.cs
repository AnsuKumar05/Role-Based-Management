using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using HotelManagementSystem.Application.DTOs;
using HotelManagementSystem.Application.Interfaces;
using HotelManagementSystem.Application.Interfaces.Repositories;
using HotelManagementSystem.Domain.Entities;

namespace HotelManagementSystem.Application.Services
{
    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IMemoryCache _cache;
        private static CancellationTokenSource _menuCacheCts = new();
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(15);

        public MenuService(IMenuRepository menuRepository, IMemoryCache cache)
        {
            _menuRepository = menuRepository;
            _cache = cache;
        }

        public void InvalidateCache()
        {
            var oldCts = Interlocked.Exchange(ref _menuCacheCts, new CancellationTokenSource());
            try
            {
                oldCts.Cancel();
                oldCts.Dispose();
            }
            catch (ObjectDisposedException) { }
        }

        public async Task<List<MenuItem>> GetMenuAsync(string category = null)
        {
            var normalizedCat = category?.Trim().ToLower() ?? "all";
            var cacheKey = $"menu_items_{normalizedCat}";

            if (_cache.TryGetValue(cacheKey, out List<MenuItem> cachedItems))
            {
                return cachedItems;
            }

            var items = await _menuRepository.GetActiveMenuItemsAsync(category);

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(CacheDuration)
                .AddExpirationToken(new CancellationChangeToken(_menuCacheCts.Token));

            _cache.Set(cacheKey, items, cacheOptions);
            return items;
        }

        public async Task<List<MenuItem>> GetAdminMenuAsync()
        {
            return await _menuRepository.GetAllMenuItemsAsync();
        }

        public async Task<List<MenuItem>> GetDeletedMenuAsync()
        {
            return await _menuRepository.GetDeletedMenuItemsAsync();
        }

        public async Task<MenuItem> AddMenuItemAsync(MenuItemCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new Exception("Dish name is required.");
            }

            var item = new MenuItem
            {
                Name = dto.Name.Trim(),
                Category = string.IsNullOrWhiteSpace(dto.Category) ? "Vegetarian" : dto.Category.Trim(),
                Price = dto.Price,
                DietType = string.IsNullOrWhiteSpace(dto.DietType) ? "Vegetarian" : dto.DietType.Trim(),
                Tag = dto.Tag?.Trim() ?? string.Empty,
                Description = dto.Description?.Trim() ?? string.Empty,
                ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? "images/food/paneer-butter-masala.jpg" : dto.ImageUrl.Trim(),
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _menuRepository.AddAsync(item);
            InvalidateCache();
            return created;
        }

        public async Task<MenuItem> UpdateMenuItemAsync(int id, MenuItemCreateDto dto)
        {
            var existing = await _menuRepository.GetByIdAsync(id);
            if (existing == null || existing.IsDeleted)
            {
                return null;
            }

            existing.Name = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name.Trim() : existing.Name;
            existing.Category = !string.IsNullOrWhiteSpace(dto.Category) ? dto.Category.Trim() : existing.Category;
            existing.Price = dto.Price > 0 ? dto.Price : existing.Price;
            existing.DietType = dto.DietType ?? existing.DietType;
            existing.Tag = dto.Tag ?? existing.Tag;
            existing.Description = dto.Description ?? existing.Description;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                existing.ImageUrl = dto.ImageUrl.Trim();
            }

            await _menuRepository.UpdateAsync(existing);
            InvalidateCache();
            return existing;
        }

        public async Task<bool> DeleteMenuItemAsync(int id)
        {
            var existing = await _menuRepository.GetByIdAsync(id);
            if (existing == null || existing.IsDeleted)
            {
                return false;
            }

            existing.IsDeleted = true;
            await _menuRepository.UpdateAsync(existing);
            InvalidateCache();
            return true;
        }

        public async Task<MenuItem> RestoreMenuItemAsync(int id)
        {
            var existing = await _menuRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return null;
            }

            existing.IsDeleted = false;
            await _menuRepository.UpdateAsync(existing);
            InvalidateCache();
            return existing;
        }
    }
}
