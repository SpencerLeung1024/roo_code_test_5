import type { Player, Tile as TileType, OwnershipMap } from '../../types';
import styles from './Tile.module.css';

type Props = {
  tile: TileType;
  ownership: OwnershipMap;
  players: Player[];
  tileIndex: number;
  currentPlayerId?: string | null;
};

function getOwnerColor(ownerIndex: number): string {
  const palette = [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#f1c40f', // yellow
    '#9b59b6', // purple
    '#e67e22', // orange
    '#1abc9c', // teal
    '#34495e', // dark
  ];
  return palette[ownerIndex % palette.length];
}

export default function Tile({ tile, ownership, players, tileIndex, currentPlayerId }: Props) {
  const own = ownership[tile.id];
  const ownerIndex = own?.ownerId ? players.findIndex(p => p.id === own.ownerId) : -1;
  const ownerColor = ownerIndex >= 0 ? getOwnerColor(ownerIndex) : undefined;

  const isCurrentHere = players.some(p => p.id === currentPlayerId && p.position === tileIndex);

  // buildings: 0-4 houses, 5 = hotel
  const houseCount = own?.houses ?? 0;
  const houses = houseCount > 0 && houseCount < 5 ? houseCount : 0;
  const hasHotel = houseCount === 5;

  return (
    <div className={isCurrentHere ? styles.highlight : undefined} style={{ height: '100%', width: '100%' }}>
      <div className={styles.tile}>
        <div className={styles.header}>
          {ownerColor && <span className={styles.owner} style={{ background: ownerColor }} />}
          <span className={styles.name} title={tile.name}>{tile.name}</span>
          <span className={styles.index}>#{tileIndex}</span>
        </div>
        <div className={styles.buildings}>
          {Array.from({ length: houses }).map((_, i) => (<span key={i} className={styles.house} />))}
          {hasHotel && <span className={styles.hotel} />}
        </div>
      </div>
    </div>
  );
}