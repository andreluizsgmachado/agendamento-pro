<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    name: 'Pro',
    price: 19.99,
    features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
  },
  {
    name: 'Enterprise',
    price: 49.99,
    features: ['All Pro features', 'Feature 7', 'Feature 8', 'Priority Support'],
  },
];

const handleSubscribe = (planName: string) => {
  router.push({ 
    name: 'register',
    query: { plan: planName.toLowerCase() }
  });
};
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <h1 class="title">Transform Your Business</h1>
      <p class="subtitle">Choose the perfect plan for your needs and start growing today</p>
    </section>

    <section class="pricing">
      <div class="plans-grid">
        <div v-for="plan in plans" :key="plan.name" class="plan-card">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            <span class="currency">$</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period">/month</span>
          </div>
          <ul class="features-list">
            <li v-for="feature in plan.features" :key="feature">
              {{ feature }}
            </li>
          </ul>
          <button 
            class="subscribe-button"
            @click="handleSubscribe(plan.name)"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.hero {
  text-align: center;
  margin-bottom: var(--spacing-16);
  animation: fadeIn var(--transition-normal);
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-4);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-gray-600);
  max-width: 600px;
  margin: 0 auto;
}

.pricing {
  padding: var(--spacing-8) 0;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-8);
  margin-top: var(--spacing-8);
}

.plan-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.plan-name {
  font-size: 1.5rem;
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-4);
}

.plan-price {
  margin-bottom: var(--spacing-6);
  color: var(--color-gray-900);
}

.currency {
  font-size: 1.5rem;
  vertical-align: top;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
}

.period {
  color: var(--color-gray-600);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-6);
}

.features-list li {
  padding: var(--spacing-2) 0;
  color: var(--color-gray-700);
}

.subscribe-button {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.subscribe-button:hover {
  background-color: var(--color-primary-700);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
}
</style>