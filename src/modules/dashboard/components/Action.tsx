import React, { ReactElement, useEffect } from 'react';
import styled from 'styled-components';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshAnimatedIcon from 'src/assets/icons/refresh_animated.svg';

type ActionItem = {
  label: string;
  onClick: () => void;
};
type ActionProps = {
  loading?: boolean;
  items: ActionItem[];
};
const Action = ({ loading, items }: ActionProps): ReactElement => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = (i: ActionItem) => {
    i.onClick();
    handleClose();
  };

  useEffect(() => {
    if (loading && anchorEl)
      setAnchorEl(null);
  }, [loading, anchorEl]);

  if (loading) return <RefreshIconStyled />;

  return (
    <>
      <IconButton
        data-testid='action-button'
        onClick={handleOpen}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        {items.map((i) => (
          <MenuItem key={i.label} onClick={() => onClick(i)}>
            {i.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Action;

const RefreshIconStyled = styled(RefreshAnimatedIcon)`
  width: 36px;
  height: 36px;
`;
