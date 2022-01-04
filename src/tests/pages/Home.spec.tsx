import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';

import Home, { getStaticProps } from '../../pages';
import { stripe } from '../../services/stripe';

jest.mock('next/router');
jest.mock('next-auth/react', () => {
  return {
    useSession: () => [null, false],
  };
});

jest.mock('../../services/stripe');

describe('Home page', () => {
  it('render correctly', () => {
    render(<Home product={{ priceId: 'fake-price-id', amount: 'R$10,00' }} />);

    expect(screen.getByText(/R\$10,00/i)).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-stripe-id',
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-stripe-id',
            amount: '$10.00',
          },
        },
      })
    );
  });
});
