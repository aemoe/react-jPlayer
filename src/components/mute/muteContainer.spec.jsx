import React from 'react';
import expect, { createSpy } from 'expect';
import { getJPlayers } from '../../util/common.spec';
import { setMute } from '../../actions/actions';
import { __get__ } from './muteContainer';

const mapStateToProps = __get__('mapStateToProps');
const mapDispatchToProps = __get__('mapDispatchToProps');
const id = 'jPlayer-1';
const attributes = {
  'data-test': 'test',
};
const children = <div />;

describe('MuteContainer', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = createSpy();
  });

  it('maps state', () => {
    const expected = mapStateToProps(getJPlayers(), { id, children, ...attributes });

    expect(expected).toEqual({
      muted: false,
      id,
      children,
      attributes,
    });
  });

  const muteData = [
    { muted: false },
    { muted: true },
  ];

  it('mapDispatchToProps onClick toggles mute', () => {
    muteData.forEach((datum) => {
      const mappedDispatched = mapDispatchToProps(dispatch);

      mappedDispatched.onClick(id, datum.muted);

      expect(dispatch).toHaveBeenCalledWith(setMute(id, !datum.muted));
    });
  });
});
