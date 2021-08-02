import * as tabs from '../../config/tabs';
import * as motives from '../../config/motives';


/*
 * Returns the intial state value for the trackDetail component.
 */
export const initialState = function() {
  return {
    tab: tabs.MARKERS,
    motive: motives.LISTEN,
    form: {
      marker: {
        timestamp: '',
        name: '',
      },
      interval: {
        modification: 'muted',
        lowerBoundMarkerUuid: 'null',
        upperBoundMarkerUuid: 'null',
      },
    }
  };
}

/*
 * Sets active tab.
 */
export const setTab = function(state, payload) {
  const { tab } = payload,
        trackDetail = { ...state.trackDetail };
  trackDetail.tab = tab;
  return { ...state, trackDetail };
}

/*
 * Sets active motive.
 */
export const setMotive = function(state, payload) {
  const { motive } = payload,
        trackDetail = { ...state.trackDetail };
  trackDetail.motive = motive;
  return { ...state, trackDetail };
}

/*
 * Set form data for the marker and interval forms.
 */
export const setForm = function(state, payload) {
  const { marker, interval } = payload,
        trackDetail = { ...state.trackDetail };
  trackDetail.form = {
    marker: { ...trackDetail.form.marker, ...marker },
    interval: { ...trackDetail.form.interval, ...interval },
  }
  return { ...state, trackDetail };
}

/*
 * Reset track detail data.
 */
export const reset = function(state, payload) {
  const trackDetail = initialState();
  return { ...state, trackDetail };
}
