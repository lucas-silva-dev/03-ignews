import { render, screen, fireEvent } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { mocked } from 'jest-mock';

import { SubscribeButton } from '.';

jest.mock('next-auth/react');

jest.mock('next/router');

describe('SignInButton Component', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<SubscribeButton />);

    expect(screen.getByText('Subscribe now')).toBeInTheDocument();
  });

  it('redirects user to sign in when not authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    const signInMocked = mocked(signIn);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it('redirects to posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires',
      },
      status: 'authenticated',
    });

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<SubscribeButton />);

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });
});
