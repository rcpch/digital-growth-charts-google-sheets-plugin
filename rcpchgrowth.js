import ‘google-apps-script';

/**
 * Returns an SDS for a given measurement, 2 dates and a sex, using the UK-WHO reference.
//  * @param {date} birth_date. (must be YYY-MM-DD)
//  * @param {date} observation_date. (must be YYY-MM-DD)
//  * @param {integer} gestation weeks.
//  * @param {integer} gestation days.
//  * @param {string} sex: must be one of male or female
//  * @param {string} measurement_method: must be one of height, weight, ofc or bmi
//  * @param {number} observation_value: 
 * @return The SDS and centile for the decimal age corrected for gestation at birth, the SDS and centile for the decimal age unadjusted for gestation at birth. Pass the dates in as text.
 * @customfunction
 */

function UK_WHO_SDS_CENTILE(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value
) {
  if (isNaN(gestation_weeks) || isNaN(gestation_days)) {
    throw "The gestations are not numbers";
  }
  if (birth_date === null || birth_date === undefined) {
    throw birth_date + " is null";
  }
  if (["height", "weight", "ofc", "bmi"].indexOf(measurement_method) === -1) {
    throw measurement_method + " is not a correct measurement method";
  }
  if (isNaN(observation_value)) {
    throw observation_value + " is not a number.";
  }

  // birth_date="2020-1-12";
  // observation_date="2022-1-12";
  // sex="male";
  // gestation_weeks=32
  // gestation_days=1
  // measurement_method="height";
  // observation_value=92;

  var formData = {
    birth_date: birth_date,
    observation_date: observation_date,
    sex: sex,
    gestation_weeks: gestation_weeks,
    gestation_days: gestation_days,
    measurement_method: measurement_method,
    observation_value: observation_value,
  };

  // return [[birth_date, observation_date, sex, gestation_weeks, gestation_days, measurement_method, observation_value]]

  var jsonified = JSON.stringify(formData);

  var url =
    "https://api.rcpch.ac.uk/uk-who/calculation";
  var request = {
    url: url,
    payload: jsonified,
    muteHttpExceptions: true,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  var response;

  try {
    response = UrlFetchApp.fetch(url, request);
    Logger.log(response);
  } catch (error) {
    throw error;
  }

  var results = JSON.parse(response);

  // var chronological_age = results.measurement_dates.chronological_decimal_age
  // var corrected_age = results.measurement_dates.corrected_decimal_age
  if (results.measurement_calculated_values === undefined) {
    throw "Null returned from API";
  }
  var corrected_sds = results.measurement_calculated_values.corrected_sds;
  var chronological_sds =
    results.measurement_calculated_values.chronological_sds;
  var corrected_centile =
    results.measurement_calculated_values.corrected_centile;
  var chronological_centile =
    results.measurement_calculated_values.chronological_centile;

  return [
    [
      corrected_sds,
      corrected_centile,
      chronological_sds,
      chronological_centile,
    ],
  ];
}

/**
 * Returns a Centile for a given measurement, 2 dates and a sex, using the UK-WHO reference.
 * @param {date} birth_date. (must be YYY-MM-DD)
 * @param {date} observation_date. (must be YYY-MM-DD)
 * @param {integer} gestation weeks.
 * @param {integer} gestation days.
 * @param {string} sex: must be one of male or female
 * @param {string} measurement_method: must be one of height, weight, ofc or bmi
 * @param {number} observation_value:
 * @return the centile from the measurement, sex and dates supplied.
 * @customfunction
 */

function UK_WHO_Centile(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value
) {
  var formData = {
    birth_date: birth_date,
    observation_date: observation_date,
    sex: sex,
    gestation_weeks: gestation_weeks,
    gestation_days: gestation_days,
    measurement_method: measurement_method,
    observation_value: observation_value,
  };
  var jsonified = JSON.stringify(formData);

  var request = {
    url: url,
    payload: jsonified,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  var url = "https://api.rcpch.ac.uk/uk-who/calculation";

  var response = UrlFetchApp.fetch(url, request);

  var results = JSON.parse(response);
  var chronological_age = results.measurement_dates.chronological_decimal_age;
  var corrected_age = results.measurement_dates.corrected_decimal_age;
  var sds = results.measurement_calculated_values.sds;
  var centile = results.measurement_calculated_values.centile;

  return centile;
}

/**
 * Returns the chronological age as a decimal from 2 dates.
 * @param {date} birth_date. (must be YYY-MM-DD)
 * @param {date} observation_date. (must be YYY-MM-DD)
 * @param {integer} gestation weeks.
 * @param {integer} gestation days.
 * @param {string} sex: must be one of male or female
 * @param {string} measurement_method: must be one of height, weight, ofc or bmi
 * @param {number} observation_value:
 * @return The chronological age.
 * @customfunction
 */

function chronological_age(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value
) {
  var formData = {
    birth_date: birth_date,
    observation_date: observation_date,
    sex: sex,
    gestation_weeks: gestation_weeks,
    gestation_days: gestation_days,
    measurement_method: measurement_method,
    observation_value: observation_value,
  };
  var jsonified = JSON.stringify(formData);

  var request = {
    url: url,
    payload: jsonified,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  var url = "https://api.rcpch.ac.uk/uk-who/calculation";

  var response = UrlFetchApp.fetch(url, request);

  var results = JSON.parse(response);
  var chronological_age = results.measurement_dates.chronological_decimal_age;
  var corrected_age = results.measurement_dates.corrected_decimal_age;
  var sds = results.measurement_calculated_values.sds;
  var centile = results.measurement_calculated_values.centile;

  return chronological_age;
}

/**
 * Returns a decimal age corrected for gestational age if premature (< 37 weeks gestation)
 * @param {date} birth_date. (must be YYY-MM-DD)
 * @param {date} observation_date. (must be YYY-MM-DD)
 * @param {integer} gestation weeks.
 * @param {integer} gestation days.
 * @param {string} sex: must be one of male or female
 * @param {string} measurement_method: must be one of height, weight, ofc or bmi
 * @param {number} observation_value:
 * @return The corrected decimal age
 * @customfunction
 */

function corrected_age(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value
) {
  var formData = {
    birth_date: birth_date,
    observation_date: observation_date,
    sex: sex,
    gestation_weeks: gestation_weeks,
    gestation_days: gestation_days,
    measurement_method: measurement_method,
    observation_value: observation_value,
  };
  var jsonified = JSON.stringify(formData);

  var request = {
    url: url,
    payload: jsonified,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  var url = "https://api.rcpch.ac.uk/uk-who/calculation";

  var response = UrlFetchApp.fetch(url, request);

  var results = JSON.parse(response);
  var chronological_age = results.measurement_dates.chronological_decimal_age;
  var corrected_age = results.measurement_dates.corrected_decimal_age;
  var sds = results.measurement_calculated_values.sds;
  var centile = results.measurement_calculated_values.centile;

  return corrected_age;
}
