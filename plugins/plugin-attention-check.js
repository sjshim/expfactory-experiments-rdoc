/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
var jsPsychAttentionCheckRdoc = (function(jspsych) {
    'use strict';

    const info = {
        name: "html-keyboard-response",
        parameters: {
            /**
             * The HTML string to be displayed.
             */
            /**
          * List of questions in HTML
          */
            question: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Question",
                default: null,

                description: "The attention check questions to be displayed.",
            },
            /**
         * List of answers to questions
         */
            key_answer: {
                type: jspsych.ParameterType.KEYCODE,
                pretty_name: "Key answer",
                default: null,

                description: "The correct key codes for the attention check questions.",
            },

            /**
             * Array containing the key(s) the subject is allowed to press to respond to the stimulus.
             */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: "ALL_KEYS",
            },
            /**
             * Any content here will be displayed below the stimulus.
             */
            prompt: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Prompt",
                default: null,
            },
            /**
             * How long to show the stimulus.
             */
            stimulus_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Stimulus duration",
                default: null,
            },
            /**
             * How long to show trial before it ends.
             */
            trial_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Trial duration",
                default: null,
            },
            /**
             * If true, trial will end when subject makes a response.
             */
            response_ends_trial: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Response ends trial",
                default: true,
            },
        },
    };
    /**
     * **html-keyboard-response**
     *
     * jsPsych plugin for displaying a stimulus and getting a keyboard response
     *
     * @author Logan Bennett
     */
    class AttentionCheckRdocPlugin {
        constructor (jsPsych) {
            this.jsPsych = jsPsych;
        }
        trial(display_element, trial) {

            var current_question = trial.question;
            var current_key_answer = trial.key_answer;

            var new_html = '<div id="jspsych-attention-check-rdoc-stimulus">' + current_question + "</div>";
            // add prompt
            if (trial.prompt !== null) {
                new_html += trial.prompt;
            }
            // draw
            display_element.innerHTML = new_html;
            // store response
            var response = {
                rt: null,
                key: null,
            };
            // function to end trial when it is time
            const end_trial = () => {
                // kill any remaining setTimeout handlers
                this.jsPsych.pluginAPI.clearAllTimeouts();
                // kill keyboard listeners
                if (typeof keyboardListener !== "undefined") {
                    this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }

                var keyString = String.fromCharCode(current_key_answer).toLowerCase()

                // gather the data to store for the trial
                var trial_data = {
                    current_question: current_question,
                    current_key_answer: current_key_answer,
                    correct_trial: keyString == response.key,
                    response: response.key,
                    rt: response.rt
                };
                // clear the display
                display_element.innerHTML = "";
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };
            // function to handle responses by the subject
            var after_response = (info) => {
                // after a valid response, the stimulus will have the CSS class 'responded'
                // which can be used to provide visual feedback that a response was recorded
                display_element.querySelector("#jspsych-attention-check-rdoc-stimulus").className +=
                    " responded";
                // only record the first response
                if (response.key == null) {
                    response = info;
                }
                if (trial.response_ends_trial) {
                    end_trial();
                }
            };
            // start the response listener
            if (trial.choices != "NO_KEYS") {
                var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: "performance",
                    persist: false,
                    allow_held_key: false,
                });
            }
            // hide stimulus if stimulus_duration is set
            if (trial.stimulus_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(() => {
                    display_element.querySelector("#jspsych-attention-check-rdoc-stimulus").style.visibility = "hidden";
                }, trial.stimulus_duration);
            }
            // end trial if trial_duration is set
            if (trial.trial_duration !== null) {
                this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
            }
        }
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options);
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }
        create_simulation_data(trial, simulation_options) {
            const default_data = {
                current_question: current_question,
                current_key_answer: current_key_answer,
                rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
                response: this.jsPsych.pluginAPI.getValidKey(trial.choices),
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }
        simulate_data_only(trial, simulation_options) {
            const data = this.create_simulation_data(trial, simulation_options);
            this.jsPsych.finishTrial(data);
        }
        simulate_visual(trial, simulation_options, load_callback) {
            const data = this.create_simulation_data(trial, simulation_options);
            const display_element = this.jsPsych.getDisplayElement();
            this.trial(display_element, trial);
            load_callback();
            if (data.rt !== null) {
                this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
            }
        }
    }
    AttentionCheckRdocPlugin.info = info;

    return AttentionCheckRdocPlugin;

})(jsPsychModule);
