import "google-apps-script";

// Validation function for input parameters - throws errors, does not return anything.
function test_helper_(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value,
  data_to_return = "both",
  data_to_return_options,
  primary_api_key
) {
  if (birth_date === null) {
    throw birth_date + " is null";
  }

  if (observation_date === null) {
    throw observation_date + " is null";
  }

  if (isNaN(gestation_weeks) || isNaN(gestation_days)) {
    throw "The gestations are not numbers";
  }

  if (["male", "female"].indexOf(sex) === -1) {
    throw sex + ' is not a correct sex. Must be one of "male" or "female"';
  }

  if (["height", "weight", "ofc", "bmi"].indexOf(measurement_method) === -1) {
    throw measurement_method + " is not a correct measurement method";
  }

  if (isNaN(observation_value)) {
    throw observation_value + " is not a number.";
  }

  if (primary_api_key == null) {
    throw primary_api_key + " is null";
  }

  if (data_to_return_options.indexOf(data_to_return) === -1) {
    throw data_to_return + ' can only be "both", "centiles", or "sds"';
  }
}

/**
 * Returns an SDS and/or centile for a given measurement, 2 dates and a sex, using the UK-WHO reference.
 * @param {date} birth_date Must be date format
 * @param {date} observation_date Must be date format
 * @param {integer} gestation_weeks Must be integer
 * @param {integer} gestation_days Must be integer
 * @param {string} sex Must be one of male, female
 * @param {string} measurement_method Must be one of height, weight, ofc, bmi
 * @param {number} observation_value
 * @param {string} primary_api_key Your primary_api_key
 * @param {string} data_to_return OPTIONAL, default "both", must be one of "both", "centiles", "sds"
 * @return The requested measurements in the following order: chronological SDS -> corrected SDS -> -> chronological centile -> corrected centile.
 * @customfunction
 */
function UK_WHO_SDS_CENTILE(
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value,
  data_to_return = "both",
  primary_api_key
) {
  // validate inputs
  test_helper_(
    birth_date,
    observation_date,
    gestation_weeks,
    gestation_days,
    sex,
    measurement_method,
    observation_value,
    data_to_return,
    (data_to_return_options = ["both", "sds", "centile"]),
    primary_api_key
  );

  // convert DateTime objects to strings
  birth_date = birth_date.toISOString().split("T")[0];
  observation_date = observation_date.toISOString().split("T")[0];

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

  var url = "https://api.rcpch.ac.uk/growth/v1/uk-who/calculation";

  var request = {
    url: url,
    payload: jsonified,
    muteHttpExceptions: true,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Subscription-Key": primary_api_key,
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

  if (results.measurement_calculated_values === undefined) {
    throw "Null returned from API";
  }
  var chronological_sds =
    results.measurement_calculated_values.chronological_sds;
  var corrected_sds = results.measurement_calculated_values.corrected_sds;
  var chronological_centile =
    results.measurement_calculated_values.chronological_centile;
  var corrected_centile =
    results.measurement_calculated_values.corrected_centile;

  let return_data;

  switch (data_to_return) {
    case "both":
      return_data = [
        [
          corrected_sds,
          chronological_sds,
          corrected_centile,
          chronological_centile,
        ],
      ];
      break;
    case "sds":
      return_data = [[corrected_sds, chronological_sds]];
      break;
    case "centiles":
      return_data = [[corrected_centile, chronological_centile]];
      break;
  }

  return return_data;
}

/**
 * Returns the chronological age as a decimal from 2 dates, and/or decimal age corrected for gestational age if premature (< 37 weeks gestation).
 * @param {date} birth_date Must be date format
 * @param {date} observation_date Must be date format
 * @param {integer} gestation_weeks Must be integer
 * @param {integer} gestation_days Must be integer
 * @param {string} sex Must be one of male, female
 * @param {string} measurement_method Must be one of height, weight, ofc, bmi
 * @param {number} observation_value
 * @param {string} primary_api_key Your primary_api_key
 * @param {string} data_to_return OPTIONAL, default "both", must be one of "both", "chron", "corr"
 * @return The requested decimal ages. If "both", returns in the following order: chronological age -> corrected age.
 * @customfunction
 */
function UK_WHO_CORRECTED_DECIMAL_AGE (
  birth_date,
  observation_date,
  gestation_weeks,
  gestation_days,
  sex,
  measurement_method,
  observation_value,
  data_to_return = "both",
  primary_api_key
) {
  // validate inputs
  test_helper_(
    birth_date,
    observation_date,
    gestation_weeks,
    gestation_days,
    sex,
    measurement_method,
    observation_value,
    data_to_return,
    (data_to_return_options = ["both", "chron", "corr"]),
    primary_api_key
  );

  // convert DateTime objects to strings
  birth_date = birth_date.toISOString().split("T")[0];
  observation_date = observation_date.toISOString().split("T")[0];

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
      "Subscription-Key": primary_api_key,
    },
  };

  var url = "https://api.rcpch.ac.uk/growth/v1/uk-who/calculation";

  var response = UrlFetchApp.fetch(url, request);

  var results = JSON.parse(response);

  var chronological_age = results.measurement_dates.chronological_decimal_age;
  var corrected_age = results.measurement_dates.corrected_decimal_age;

  let return_data;

  switch (data_to_return) {
    case "both":
      return_data = [[chronological_age, corrected_age]];
      break;
    case "chron":
      return_data = [[chronological_age]];
      break;
    case "corr":
      return_data = [[corrected_age]];
      break;
  }

  return return_data;
}
