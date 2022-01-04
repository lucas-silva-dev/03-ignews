import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>This is my new post</p>',
  updatedAt: 'December, 30',
};

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock('../../services/prismic');

describe('Post preview page', () => {
  it('render correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<Post post={post} />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('This is my new post')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        activeSubscription: 'fake-active-subscription',
      },
    } as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'This is my new post' }],
        },
        last_publication_date: '2021-12-31',
      }),
    } as any);

    const response = await getStaticProps({ params: { slug: 'my-new-post' } });

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
