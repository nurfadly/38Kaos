import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { Box, Typography, Flex, Loader } from '@strapi/design-system';

const LeadsWidget = () => {
  const { get } = useFetchClient();
  const [total, setTotal] = useState(null);
  const [baru, setBaru] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      get('/content-manager/collection-types/api::lead.lead', {
        params: { page: 1, pageSize: 1 },
      }),
      get('/content-manager/collection-types/api::lead.lead', {
        params: { page: 1, pageSize: 1, filters: { status: { $eq: 'baru' } } },
      }),
    ])
      .then(([allRes, baruRes]) => {
        if (!active) return;
        setTotal(allRes.data?.pagination?.total ?? 0);
        setBaru(baruRes.data?.pagination?.total ?? 0);
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
        <Typography textColor="danger600">Gagal memuat data Leads.</Typography>
      </Box>
    );
  }

  if (total === null) {
    return (
      <Flex alignItems="center" justifyContent="center" height="100%">
        <Loader small>Memuat...</Loader>
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="flex-start" justifyContent="center" height="100%" padding={4} gap={2}>
      <Typography variant="alpha" fontWeight="bold">
        {total}
      </Typography>
      <Typography textColor="neutral600">Total Leads Masuk (Kontak Website)</Typography>
      {baru > 0 && (
        <Typography textColor="warning600" fontWeight="bold">
          {baru} belum diproses (status: baru)
        </Typography>
      )}
    </Flex>
  );
};

export default LeadsWidget;
