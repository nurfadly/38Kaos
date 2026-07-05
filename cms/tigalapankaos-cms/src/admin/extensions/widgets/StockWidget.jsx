import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { Box, Typography, Flex, Loader } from '@strapi/design-system';

const StockWidget = () => {
  const { get } = useFetchClient();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    get('/content-manager/collection-types/api::product.product', {
      params: {
        page: 1,
        pageSize: 6,
        sort: 'stockQuantity:ASC',
        fields: ['name', 'stockQuantity', 'stockAvailable'],
      },
    })
      .then((res) => {
        if (!active) return;
        const results = res.data?.results || [];
        setProducts(results.map((it) => (it.attributes ? { id: it.id, ...it.attributes } : it)));
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [get]);

  if (error) {
    return (
      <Box padding={4}>
        <Typography textColor="danger600">Gagal memuat data stok produk.</Typography>
      </Box>
    );
  }

  if (products === null) {
    return (
      <Flex alignItems="center" justifyContent="center" height="100%">
        <Loader small>Memuat...</Loader>
      </Flex>
    );
  }

  if (products.length === 0) {
    return (
      <Box padding={4}>
        <Typography textColor="neutral600">Belum ada produk.</Typography>
      </Box>
    );
  }

  return (
    <Box padding={4} height="100%" style={{ overflowY: 'auto' }}>
      <Typography variant="sigma" textColor="neutral600">
        Stok Paling Menipis
      </Typography>
      <Flex direction="column" alignItems="stretch" gap={2} marginTop={2}>
        {products.map((p) => (
          <Flex key={p.id} justifyContent="space-between">
            <Typography ellipsis>{p.name}</Typography>
            <Typography
              fontWeight="bold"
              textColor={
                !p.stockAvailable || !p.stockQuantity ? 'danger600' : p.stockQuantity <= 5 ? 'warning600' : 'success600'
              }
            >
              {p.stockQuantity ?? 0} pcs
            </Typography>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default StockWidget;
