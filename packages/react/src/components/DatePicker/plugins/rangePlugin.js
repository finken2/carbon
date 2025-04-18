/**
 * Copyright IBM Corp. 2019, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rangePlugin from 'flatpickr/dist/plugins/rangePlugin';

/**
 * @param {object} config Plugin configuration.
 * @returns {Plugin} An extension of Flatpickr `rangePlugin` that does the following:
 *   * Better ensures the calendar dropdown is always aligned to the `<input>` for the starting date.
 *     Workaround for: https://github.com/flatpickr/flatpickr/issues/1944
 *   * A logic to ensure `fp.setDate()` call won't end up with "startDate to endDate" set to the first `<input>`
 */
export default (config) => {
  const factory = rangePlugin(Object.assign({ position: 'left' }, config));
  return (fp) => {
    const origSetDate = fp.setDate;

    const init = () => {
      fp.setDate = function setDate(dates, triggerChange, format) {
        origSetDate.call(this, dates, triggerChange, format);
        // If `triggerChange` is `true`, `onValueUpdate` Flatpickr event is fired
        // where Flatpickr's range plugin takes care of fixing the first `<input>`
        if (!triggerChange && dates.length === 2) {
          const { _input: inputFrom } = fp;
          const { input: inputTo } = config;
          [inputFrom, inputTo].forEach((input, i) => {
            if (input) {
              input.value = !dates[i]
                ? ''
                : fp.formatDate(new Date(dates[i]), fp.config.dateFormat);
            }
          });
        }
      };
    };

    const origRangePlugin = factory(fp);
    const { onReady: origOnReady } = origRangePlugin;

    return Object.assign(origRangePlugin, {
      onReady: [init, origOnReady],
      onPreCalendarPosition() {},
    });
  };
};
