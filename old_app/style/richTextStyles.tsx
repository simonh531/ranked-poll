import { INLINES } from '@contentful/rich-text-types';
import { Typography } from '@mui/material';

export default {
  renderNode: {
    [INLINES.HYPERLINK]: (node, children) => {
      const { data } = node;
      return (
        <Typography
          component="a"
          href={data.uri}
          sx={{
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {children}
        </Typography>
      );
    },
  },
};
