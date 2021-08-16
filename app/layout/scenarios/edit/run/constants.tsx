/*
  eslint-disable max-len
*/

import React from 'react';

export const FIELDS = [
  {
    id: 'NUMREPS',
    label: 'Number of Runs',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Number of runs</h4>
        <p>
          The number of repeat runs you want Marxan to perform;
          effectively, the number of solutions to the reserve
          problem you want Marxan to generate.
        </p>
        <p>
          Each new run
          is independent of the previous one, but they will
          all use the same parameter and variable values.
          The frequency with which planning units are
          selected in multiple runs, gives an indication
          of the importance of that planning unit for
          efficiently meeting your reserve targets.
        </p>
        <p>
          When running a new scenario for the first
          time it is always advisable, to begin with
          a very small number of runs (e.g. 10) so
          you can check the program is performing as
          desired (i.e. the solutions are meeting the
          required targets) without having to wait a
          long time.
        </p>
        <p>
          In order to get an idea of selection
          frequency, however, you will generally
          need to do many runs.
        </p>
        <p>
          100 runs are the
          standard best practice, as it is an intuitive
          value from which to calculate selection frequency.
          Adding more runs will sample more of the solution
          space but will of course increase
          the processing time.
        </p>
      </div>),
    category: {
      id: 'general-parameters',
      label: 'General parameters',
    },
    default: 10,
    required: true,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 1,
      max: 10000,
      type: 'number',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 10000,
        },
      },
    ],
  },
  {
    id: 'BLM',
    label: 'Clumping',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Boundary Length Modifier (BLM)</h4>
        <p>
          The BLM should be either ‘0’ or a positive number.
        </p>
        <p>
          It is permissible for the BLM to include decimal
          points (e.g. 0.1). Setting the BLM to ‘0’ will
          remove boundary length from consideration altogether.
        </p>
        <p>
          There is no universally good value for the BLM,
          as it works in relation to the costs and
          geometry of the study region/planning units.
        </p>
        <p>
          With a small BLM, Marxan will concentrate on
          minimizing overall reserve cost and will only
          aim for compactness when little extra cost will
          be incurred.
        </p>
        <p>
          Alternatively, a large BLM will
          place a high emphasis on minimizing the
          boundary length, even if it means a more
          costly solution.
        </p>
      </div>),
    note: '(Boundary Length Modifier)',
    category: {
      id: 'general-parameters',
      label: 'General parameters',
    },
    default: 1,
    required: false,
    advanced: false,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 10000000,
      type: 'number',
      step: '.0001',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThan: 0,
          lessThanOrEqualTo: 10000000,
        },
      },
    ],
  },
  {
    id: 'MISSLEVEL',
    label: 'Conservation Feature missing proportion',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Conservation Feature missing proportion</h4>
        <p>
          Amount or target below which a Conservation Feature
          is counted as ‘missing’.
        </p>
        <p>
          This is the proportion of the
          target a conservation feature must reach in order for
          it to be reported as met.
        </p>
        <p>
          There are situations where
          Marxan can get extremely close to the target
          (e.g. 99% of the desired level) without actually
          meeting the target.
        </p>
        <p>
          You can specify a level for
          which you are pragmatically satisfied that the
          amount of representation is close enough to the
          target to report it as met.
        </p>
        <p>
          This value should always
          be high, i.e. greater than or equal to ‘0.95’. If you
          are setting it lower than ‘0.95’, you should probably
          think about changing your targets.
        </p>
      </div>),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: 1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0.80,
      max: 1,
      type: 'number',
      step: '0.01',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0.80,
          lessThanOrEqualTo: 1,
        },
      },
    ],
  },
  {
    id: 'PROP',
    label: 'Starting Proportion',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Starting proportion</h4>
        <p>
          Proportion of planning units in initial
          reserve system.
        </p>
        <p>
          When Marxan starts a run,
          it must generate an initial reserve system.
          This variable defines the proportion of
          planning units to be included in the initial
          reserve system at the start of each run.
        </p>
        <p>
          The
          variable must be a number between 0 and 1.
          If zero is chosen then no planning units will
          be included in the initial reserve, a value of 1
          means all planning units will be included,
          and a value of 0.5 means 50% of planning
          units will be randomly included.
        </p>
        <p>
          In practice,
          the setting has no effect on the operation of
          simulated annealing, provided a sufficient
          number of iterations is used. This will only
          be applied to those planning units whose status
          does not lock them in or out of solutions
        </p>
      </div>),
    category: {
      id: 'general-parameters',
      label: 'General parameters',
    },
    default: 0.5,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 1,
      type: 'number',
      step: '.01',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 1,
        },
      },
    ],
  },
  {
    id: 'RANDSEED',
    label: 'Random seed',
    description: (
      <div className="space-y-2">
        <p>
          It controls whether the same ‘random’
          selection of planning units is included
          in the initial reserve system each run.
          Using a constant positive integer for
          this variable will make Marxan use
          the same random seed each time it is run.
          Except for debugging purposes, it
          should be set to ‘-1’.
        </p>
      </div>),
    category: {
      id: 'general-parameters',
      label: 'General parameters',
    },
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 1000,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 1000,
        },
      },
    ],
  },
  {
    id: 'BESTSCORE',
    label: 'Best Score Speedup',
    description: (
      <div className="space-y-2">

        <p>
          This variable tells Marxan not to
          keep track of the best score until
          it reaches a specified minimum level.
          It was intended to be a time saving
          measure but is seldom required.
          It should always be set to -1.
        </p>
      </div>),
    category: {
      id: 'general-parameters',
      label: 'General parameters',
    },
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: -1,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          equalTo: -1,
        },
      },
    ],
  },
  {
    id: 'NUMITNS',
    label: 'Number of Iterations',
    description: (
      <div className="space-y-2">
        <p>
          Required when RUNMODE = &quot;Simulated Annealing&quot;.
          Number of iterations for annealing
        </p>
      </div>),
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters',
    },
    default: 1000000,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 100000,
      max: 100000000,
      type: 'number',
      step: '10000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 100000000,
        },
      },
    ],
  },
  {
    id: 'STARTTEMP',
    label: 'Initial temperature',
    description: (
      <div className="space-y-2">
        <p>
          Required when RUNMODE = &quot;Simulated Annealing&quot;.
          Starting temperature for annealing.
          The use of the adaptive annealing
          schedule can be applied by setting
          the variable to any negative value
        </p>
      </div>),
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters',
    },
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 100000,
      type: 'number',
      step: '1000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 100000,
        },
      },
    ],
  },
  {
    id: 'COOLFAC',
    label: 'Cooling factor',
    description:
  <div className="space-y-2">
    <p>Required when RUNMODE = &quot;Simulated Annealing&quot;. Cooling factor for annealing</p>
  </div>,
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 100,
        },
      },
    ],
  },
  {
    id: 'NUMTEMP',
    label: 'Temperature decreases for annealing',
    description:
  <div className="space-y-2">
    <p>
      Required when RUNMODE = &quot;Simulated Annealing&quot;.
      Number of temperature decreases for annealing
    </p>
  </div>,
    category: {
      id: 'annealing-parameters',
      label: 'Annealing parameters',
    },
    default: 10000,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 1,
      max: 50000,
      type: 'number',
      step: '1000',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 1,
          lessThanOrEqualTo: 50000,
        },
      },
    ],
  },
  {
    id: 'COSTTHRESH',
    label: 'Cost threshold',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Cost threshold</h4>
        <p>
          This variable can be included if you want Marxan
          to find reserve solutions below a total cost.
        </p>
        <p>
          It works together with THRESHPEN1 and THRESHPEN2.
          Setting this variable to ‘0’ will disable it.
        </p>
        <p>
          Marxan is designed to solve
          a ‘minimum set’ problem, its goal being to meet
          all our conservation targets for the least cost.
        </p>
        <p>
          Another class of conservation problem is known
          as the ‘maximum coverage’ problem where the
          goal is to achieve the best conservation outcomes
          for a given fixed budget. In many cases, this is
          more representative of how conservation actions
          operate.
        </p>
        <p>
          Although including a cost threshold does
          not make Marxan solve the strict ‘maximum coverage’
          problem, it is comparable and can be used in cases
          where you have conservation targets you hope to meet
          and cannot exceed a predetermined budget.
        </p>
        <p>
          The actual
          way this cost threshold is applied within the algorithm
          is described in detail in
          Marxan Manual 2020 Appendix B-1.5.
        </p>
      </div>),
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'THRESHPEN1',
    label: 'Size of cost threshold penalty',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Size of cost threshold</h4>
        <p>
          This variable can be included if you want Marxan to
          find reserve solutions below a total cost.
        </p>
        <p>
          It works together with COSTTHRESH and THRESHPEN2.
          Setting this variable to ‘0’ will disable it.
        </p>
        <p>
          Marxan is designed to solve
          a ‘minimum set’ problem, its goal being to meet
          all our conservation targets for the least cost.
        </p>
        <p>
          Another class of conservation problem is known
          as the ‘maximum coverage’ problem where the
          goal is to achieve the best conservation outcomes
          for a given fixed budget. In many cases, this is
          more representative of how conservation actions
          operate.
        </p>
        <p>
          Although including a cost threshold does
          not make Marxan solve the strict ‘maximum coverage’
          problem, it is comparable and can be used in cases
          where you have conservation targets you hope to meet
          and cannot exceed a predetermined budget.
        </p>
        <p>
          The actual
          way this cost threshold is applied within the algorithm
          is described in detail in
          Marxan Manual 2020 Appendix B-1.5.
        </p>
      </div>),
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'THRESHPEN2',
    label: 'Shape of cost threshold penalty',
    description: (
      <div className="space-y-2">
        <h4 className="font-heading text-lg mb-2.5">Shape of cost threshold</h4>
        <p>
          This variable can be included if you
          want Marxan to find reserve solutions below
          a total cost.
        </p>
        <p>
          It works together with COSTTHRESH and THRESHPEN1.
        </p>
        <p>
          Marxan is designed to solve
          a ‘minimum set’ problem, its goal being to meet
          all our conservation targets for the least cost.
        </p>
        <p>
          Another class of conservation problem is known
          as the ‘maximum coverage’ problem where the
          goal is to achieve the best conservation outcomes
          for a given fixed budget. In many cases, this is
          more representative of how conservation actions
          operate.
        </p>
        <p>
          Although including a cost threshold does
          not make Marxan solve the strict ‘maximum coverage’
          problem, it is comparable and can be used in cases
          where you have conservation targets you hope to meet
          and cannot exceed a predetermined budget.
        </p>
        <p>
          The actual
          way this cost threshold is applied within the algorithm
          is described in detail in
          Marxan Manual 2020 Appendix B-1.5.
        </p>
      </div>),
    category: {
      id: 'cost-threshold',
      label: 'Cost threshold',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 100,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          greaterThanOrEqualTo: 0,
        },
      },
    ],
  },
  {
    id: 'VERBOSITY',
    label: 'Screen Output',
    description: (
      <div className="space-y-2">
        <p>The amount of information displayed on-screen while Marxan is running.</p>
        <ul className="pl-2.5 space-y-1">
          <li>0. Silent Running – Only the title of the program is displayed.</li>
          <li>1. Results Only – Marxan will display which run it is up to, the basic results of each run and the total run time.</li>
          <li>2. General Progress – In addition to the information about each run, Marxan will display information on the data that has been read in as well as details on any conservation features whose targets and requirements are such that they cannot be adequately reserved in the system.</li>
          <li>3. Detailed Progress – Shows exactly where the program is up to and gives the value of the system each time the temperature changes.</li>
        </ul>
      </div>
    ),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: 2,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 4,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 4,
        },
      },
    ],
  },
  {
    id: 'RUNMODE',
    label: 'Run option',
    description: (
      <div className="space-y-2">
        <p>This is an essential variable that defines the method Marxan will use to locate good reserve solutions. The real strength of Marxan lies in its use of Simulated Annealing to find solutions to the reserve selection problem. However, Marxan is also capable of using simpler, but more rapid, methods to locate potential solutions, such as heuristic rules and iterative improvement.</p>
        <p>There are different options:</p>
        <ul className="pl-2.5 space-y-1">
          <li>0: Apply Simulated Annealing followed by a Heuristic</li>
          <li>1: Apply Simulated Annealing followed by Iterative Improvement</li>
          <li>2: Apply Simulated Annealing followed by a Heuristic, followed by Iterative</li>
          <li>3: Use only a Heuristic</li>
          <li>4: Use only Iterative Improvement</li>
          <li>5: Use a Heuristic followed by Iterative Improvement</li>
          <li>6: Use only Simulated Annealing</li>
        </ul>
      </div>
    ),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: 1,
    required: true,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 6,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 6,
        },
      },
    ],
  },
  {
    id: 'ITIMPTYPE',
    label: 'Iterative Improvement',
    description: (
      <div className="space-y-2">
        <p>Iterative improvement type. If Iterative Improvement is being used to help find solutions, this variable defines what type of Iterative Improvement will be applied.</p>
        <p>There are four different options:</p>
        <ul className="pl-2.5 space-y-1">
          <li>0: Normal Iterative Improvement</li>
          <li>1: Two Step Iterative Improvement</li>
          <li>2: &quot;Swap&quot; Iterative Improvement</li>
          <li>3: Normal Improvement followed by Two Step Iterative Improvement</li>
        </ul>
      </div>
    ),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: 0,
      max: 3,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThanOrEqualTo: 3,
        },
      },
    ],
  },
  {
    id: 'HEURTYPE',
    label: 'Heuristic',
    description: (
      <div className="space-y-2">
        <p>If you are using an optional heuristic to find reserve solutions, this variable defines what type of heuristic algorithm will be applied.</p>
        <p>There are nine different options:</p>
        <ul className="pl-2.5 space-y-1">
          <li>-1: Ignored</li>
          <li>0: Richness</li>
          <li>1: Greedy</li>
          <li>2: Max Rarity</li>
          <li>3: Best Rarity</li>
          <li>4: Average Rarity</li>
          <li>5: Sum Rarity</li>
          <li>6: Product Irreplaceability</li>
          <li>7: Summation Irreplaceability</li>
        </ul>
      </div>
    ),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: -1,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 7,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 7,
        },
      },
    ],
  },
  {
    id: 'CLUMPTYPE',
    label: 'Clumping rule',
    description: (
      <div className="space-y-2">
        <p>Clumping penalty type. This variable is useful if some conservation features have a minimum clump size set. It tells Marxan if occurrences smaller than the minimum clump size should contribute towards the overall target, and if so, how. Be aware that this will slow down Marxan by an order of magnitude.</p>
        <p>There are different options:</p>
        <ul className="pl-2.5 space-y-1">
          <li>-1: Ignored</li>
          <li>0: Partial clumps do not count - Clumps smaller than the target score nothing</li>
          <li>1: Partial clumps count half - Clumps smaller than the target score nothing</li>
          <li>2: Graduated penalty - Score is proportional to the size of the clump</li>
        </ul>
      </div>
    ),
    category: {
      id: 'program-control',
      label: 'Program control',
    },
    default: 0,
    required: false,
    advanced: true,
    input: {
      className: 'text-2xl',
      min: -1,
      max: 2,
      type: 'number',
      step: '1',
    },
    validations: [
      {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: -1,
          lessThanOrEqualTo: 2,
        },
      },
    ],
  },
];
