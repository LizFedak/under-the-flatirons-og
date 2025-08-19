export function filterData(list, filters) {
    list.filter(item => {
      return filters.every(filter => {
        if (filter.type === 'multi') {
          if (!filter.values.length) return true;
          const value = item.values()[filter.field];
          return Array.isArray(value)
            ? value.some(v => filter.values.includes(v))
            : filter.values.includes(value);
        }
        if (filter.type === 'single') {
          if (!filter.value) return true;
          return item.values()[filter.field] === filter.value;
        }
        if (filter.type === 'boolean') {
          return !!item.values()[filter.field] === filter.value;
        }
        if (filter.type === 'range') {
          const val = Number(item.values()[filter.field]);
          return val >= filter.min && val <= filter.max;
        }
        return true;
      });
    });
  }
  