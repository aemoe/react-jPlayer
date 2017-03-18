import { connectWithId } from '../../util/index';
import Video from './video';

const mapStateToProps = ({ jPlayers }, { id, events, children, ...attributes }) => ({
  require: jPlayers[id].mediaSettings.video,
  events,
  children,
  attributes,
});

export default connectWithId(mapStateToProps)(Video);
