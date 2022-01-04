import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession } from 'next-auth/react';

import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>This is my new post</p>',
  updatedAt: 'December, 30',
};

jest.mock('next-auth/react');
jest.mock('../../services/prismic');

describe('Post page', () => {
  it('render correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('This is my new post')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      })
    );
  });

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'This is my new post' }],
        },
        last_publication_date: '2021-12-31',
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>This is my new post</p>',
            updatedAt: '30 de dezembro de 2021',
          },
        },
      })
    );
  });
});
