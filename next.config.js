module.exports = {
  async redirects() {
    return [
      {
        source: '/:id([\\w-_]{7,14})',
        destination: '/poll/:id', // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: '/poll',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
