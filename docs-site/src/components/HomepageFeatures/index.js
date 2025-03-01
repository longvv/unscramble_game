import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Interactive Learning',
    description: (
      <>
        Drag and drop letters to form words, see images, and hear pronunciations 
        for a multi-sensory learning experience.
      </>
    ),
  },
  {
    title: 'Customizable',
    description: (
      <>
        Add your own words and images to create a personalized vocabulary learning 
        experience for any learner.
      </>
    ),
  },
  {
    title: 'Modular Design',
    description: (
      <>
        Built with modern JavaScript practices, the game follows SOLID principles 
        for easy extension and modification.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}