// src/components/ranking/RankingListItem.jsx
import React from 'react';
import { FaCrown, FaMedal } from 'react-icons/fa'; // Medallas
import { HiUsers } from 'react-icons/hi2'; // Icono de equipo
import '../../styles/RankingListItem.css';

const RankIndicator = ({ rankType, rank }) => {
  if (rankType === 'badge1') return <FaCrown className="rank-badge gold" />;
  if (rankType === 'badge2') return <FaMedal className="rank-badge silver" />;
  if (rankType === 'badge3') return <FaMedal className="rank-badge bronze" />;
  return <span className="rank-number">{rank}</span>;
};

const Avatar = ({ avatar, name }) => {
    if (!avatar) return <div className="avatar-placeholder"></div>;
    return <div className="avatar">{avatar}</div>
}

const RankingListItem = ({ user, isTeamView }) => {
  return (
    <div className="list-item-card">
      <div className="rank-section">
        <RankIndicator rankType={user.type} rank={user.rank} />
      </div>
      <div className="avatar-section">
        <Avatar avatar={user.avatar} name={user.name} />
      </div>
      <div className="user-info-section">
        <span className="user-name">{user.name}</span>
        <div className="user-score">
            {isTeamView && <HiUsers className="team-icon" />}
            {user.score.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default RankingListItem;